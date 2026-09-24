import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPrivateKey, sign as signData } from 'node:crypto';
import { AppleBillingVerificationService } from './apple-billing-verification.service';
import {
  APP_STORE_PRODUCT_FAMILY,
  APP_STORE_PRODUCT_PERSONAL,
  PLAN_TYPE,
} from '../infrastructure/household.schemas';

// A self-signed EC key/cert generated locally for this test only — it deliberately does NOT
// chain to Apple's real root, so any transaction "signed" with it must be rejected. If this
// forged transaction were ever accepted, that would mean the chain-of-trust check is broken.
const FORGED_LEAF_PRIVATE_KEY_PEM = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIDDlLSgukQ/nCyMamjHl4Chr6QOTvsxBm0t1CcOfonAUoAoGCCqGSM49
AwEHoUQDQgAEkfzWaUh3l9QyHRsL4GKNM8fSSGywDvAqj3P9QEqSO1+Be/GjS4so
KRIGZ50k+Zeo5A0G1sh1PBnD0VCvIPPmCA==
-----END EC PRIVATE KEY-----`;

const FORGED_LEAF_CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIBWzCCAQACCQDOBYesie/pZTAKBggqhkjOPQQDAjA1MR8wHQYDVQQDDBZGYWtl
IEFwcGxlIFRyYW5zYWN0aW9uMRIwEAYDVQQKDAlOb3QgQXBwbGUwHhcNMjYwOTI0
MTYwODIwWhcNMjcwOTI0MTYwODIwWjA1MR8wHQYDVQQDDBZGYWtlIEFwcGxlIFRy
YW5zYWN0aW9uMRIwEAYDVQQKDAlOb3QgQXBwbGUwWTATBgcqhkjOPQIBBggqhkjO
PQMBBwNCAASR/NZpSHeX1DIdGwvgYo0zx9JIbLAO8CqPc/1ASpI7X4F78aNLiygp
EgZnnST5l6jkDQbWyHU8GcPRUK8g8+YIMAoGCCqGSM49BAMCA0kAMEYCIQDDN1Ju
v63SUZUrDM9ZW8VL0zvwYrBkKjitHjeW9sBydwIhAOneRCYlb9Z1d/wbJPpFPqkG
OsmNDE1hR6DxrdhDBpg6
-----END CERTIFICATE-----`;

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

/** Builds a compact ES256 JWS by hand — deliberately not reusing the service's own code paths. */
function signJWS(payload: unknown, header: Record<string, unknown>): string {
  const headerSegment = base64url(JSON.stringify(header));
  const payloadSegment = base64url(JSON.stringify(payload));
  const privateKey = createPrivateKey(FORGED_LEAF_PRIVATE_KEY_PEM);
  const signature = signData('sha256', Buffer.from(`${headerSegment}.${payloadSegment}`), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  });
  return `${headerSegment}.${payloadSegment}.${base64url(signature)}`;
}

describe('AppleBillingVerificationService', () => {
  const config = { get: jest.fn().mockReturnValue('com.technovolution.antyspend') } as unknown as ConfigService;
  let service: AppleBillingVerificationService;

  beforeEach(() => {
    service = new AppleBillingVerificationService(config);
  });

  it('maps known App Store product identifiers to plan types', () => {
    expect(service.productIdToPlanType(APP_STORE_PRODUCT_PERSONAL)).toBe(PLAN_TYPE.PERSONAL);
    expect(service.productIdToPlanType(APP_STORE_PRODUCT_FAMILY)).toBe(PLAN_TYPE.FAMILY);
  });

  it('rejects an unrecognized product identifier', () => {
    expect(() => service.productIdToPlanType('com.example.unknown')).toThrow(BadRequestException);
  });

  it('rejects a transaction that is not a well-formed JWS', async () => {
    await expect(service.verifyTransaction('not-a-jws')).rejects.toThrow('MALFORMED_TRANSACTION');
  });

  it('rejects a transaction whose header carries no certificate chain', async () => {
    const jws = signJWS({ productId: 'x' }, { alg: 'ES256' });
    await expect(service.verifyTransaction(jws)).rejects.toThrow('MISSING_CERTIFICATE_CHAIN');
  });

  it("rejects a transaction signed by a certificate that does not chain to Apple's root", async () => {
    const certDer = Buffer.from(
      FORGED_LEAF_CERT_PEM.replace(/-----[^-]+-----|\s/g, ''),
      'base64',
    ).toString('base64');
    const payload = {
      transactionId: '1',
      originalTransactionId: '1',
      productId: APP_STORE_PRODUCT_PERSONAL,
      bundleId: 'com.technovolution.antyspend',
      purchaseDate: Date.now(),
      expiresDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      type: 'Auto-Renewable Subscription',
    };
    const jws = signJWS(payload, { alg: 'ES256', x5c: [certDer] });

    await expect(service.verifyTransaction(jws)).rejects.toThrow('UNTRUSTED_CERTIFICATE_CHAIN');
  });
});
