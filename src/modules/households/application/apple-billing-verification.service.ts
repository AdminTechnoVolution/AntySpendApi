import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify as verifySignature, X509Certificate } from 'node:crypto';
import {
  APP_STORE_PRODUCT_FAMILY,
  APP_STORE_PRODUCT_PERSONAL,
  PLAN_TYPE,
} from '../infrastructure/household.schemas';

/**
 * Apple's official G3 root, fetched directly from https://www.apple.com/certificateauthority/AppleRootCA-G3.cer
 * (SHA-256 fingerprint 63:34:3A:BF:B8:9A:6A:03:EB:B5:7E:9B:3F:5F:A7:BE:7C:4F:5C:75:6F:30:17:B3:A8:C4:88:C3:65:3E:91:79,
 * matching Apple's published value). This is the anchor every StoreKit signed transaction's
 * certificate chain must trace back to — there is no server-side equivalent of Google's OAuth
 * service-account flow here, Apple's transactions are self-verifying via this chain instead.
 */
const APPLE_ROOT_CA_G3_PEM = `-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf
TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517
IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySr
MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA
MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4
at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM
6BgD56KyKA==
-----END CERTIFICATE-----`;

export interface VerifiedAppleTransaction {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  bundleId: string;
  expiresDateMillis: number;
  purchaseDateMillis: number;
  autoRenewStatus?: boolean;
}

interface AppleTransactionPayload {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  bundleId: string;
  expiresDate?: number;
  purchaseDate: number;
  type: string;
  revocationDate?: number;
}

/**
 * Every StoreKit purchase and renewal comes back to the device as a signed JWS
 * (`Transaction.jwsRepresentation`). Its header carries the signing certificate chain (`x5c`);
 * verifying that chain up to Apple's own root — without ever calling out to Apple — is what
 * `App Store Server Library`-style integrations do, and it's what this service does by hand
 * using Node's built-in X509Certificate plus `jose` for the signature itself.
 */
@Injectable()
export class AppleBillingVerificationService {
  private readonly logger = new Logger(AppleBillingVerificationService.name);
  private readonly rootCertificate = new X509Certificate(APPLE_ROOT_CA_G3_PEM);

  constructor(private readonly config: ConfigService) {}

  async verifyTransaction(signedTransactionInfo: string): Promise<VerifiedAppleTransaction> {
    const segments = signedTransactionInfo.split('.');
    if (segments.length !== 3) throw new BadRequestException('MALFORMED_TRANSACTION');
    const [headerSegment, payloadSegment, signatureSegment] = segments;

    const protectedHeader = this.decodeProtectedHeader(headerSegment);
    const chain = this.certificateChain(protectedHeader);
    this.verifyChainOfTrust(chain);

    if (protectedHeader.alg && protectedHeader.alg !== 'ES256') {
      // Apple has only ever signed StoreKit transactions with ES256; anything else is unexpected.
      throw new BadRequestException('UNSUPPORTED_ALGORITHM');
    }
    const signatureValid = verifySignature(
      'sha256',
      Buffer.from(`${headerSegment}.${payloadSegment}`),
      { key: chain[0].publicKey, dsaEncoding: 'ieee-p1363' },
      Buffer.from(signatureSegment, 'base64url'),
    );
    if (!signatureValid) throw new BadRequestException('INVALID_APPLE_SIGNATURE');

    let claims: AppleTransactionPayload;
    try {
      claims = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf8'));
    } catch {
      throw new BadRequestException('MALFORMED_TRANSACTION');
    }

    const expectedBundleId = this.config.get<string>('appStore.bundleId');
    if (expectedBundleId && claims.bundleId !== expectedBundleId) {
      throw new BadRequestException('BUNDLE_ID_MISMATCH');
    }
    if (claims.revocationDate) {
      throw new BadRequestException('TRANSACTION_REVOKED');
    }
    if (!claims.expiresDate) {
      // Non-renewing/consumable transactions have no expiry; Anty only sells subscriptions.
      throw new BadRequestException('NOT_A_SUBSCRIPTION');
    }

    return {
      transactionId: claims.transactionId,
      originalTransactionId: claims.originalTransactionId,
      productId: claims.productId,
      bundleId: claims.bundleId,
      expiresDateMillis: claims.expiresDate,
      purchaseDateMillis: claims.purchaseDate,
    };
  }

  productIdToPlanType(productId: string): string {
    if (productId === APP_STORE_PRODUCT_PERSONAL) return PLAN_TYPE.PERSONAL;
    if (productId === APP_STORE_PRODUCT_FAMILY) return PLAN_TYPE.FAMILY;
    throw new BadRequestException('UNKNOWN_PRODUCT_ID');
  }

  private decodeProtectedHeader(headerSegment: string): { x5c?: string[]; alg?: string } {
    try {
      return JSON.parse(Buffer.from(headerSegment, 'base64url').toString('utf8'));
    } catch {
      throw new BadRequestException('MALFORMED_TRANSACTION');
    }
  }

  private certificateChain(header: { x5c?: string[] }): X509Certificate[] {
    if (!header.x5c || header.x5c.length === 0) {
      throw new BadRequestException('MISSING_CERTIFICATE_CHAIN');
    }
    return header.x5c.map((der) => new X509Certificate(Buffer.from(der, 'base64')));
  }

  /**
   * Walks leaf -> intermediate -> root, requiring each link to both claim the next as its
   * issuer AND carry a signature that verifies against the next certificate's public key.
   * The chain from Apple never includes the root itself, so the last link is checked against
   * the embedded `APPLE_ROOT_CA_G3_PEM` instead of a further entry in `chain`.
   */
  private verifyChainOfTrust(chain: X509Certificate[]): void {
    for (let i = 0; i < chain.length - 1; i++) {
      const [certificate, issuer] = [chain[i], chain[i + 1]];
      if (!certificate.checkIssued(issuer) || !certificate.verify(issuer.publicKey)) {
        this.logger.warn(`Apple certificate chain broke at position ${i}`);
        throw new BadRequestException('UNTRUSTED_CERTIFICATE_CHAIN');
      }
    }
    const topOfChain = chain[chain.length - 1];
    if (!topOfChain.checkIssued(this.rootCertificate) || !topOfChain.verify(this.rootCertificate.publicKey)) {
      throw new BadRequestException('UNTRUSTED_CERTIFICATE_CHAIN');
    }
  }
}
