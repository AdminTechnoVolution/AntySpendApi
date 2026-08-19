import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import {
  GooglePlayCredentialsError,
  loadGooglePlayServiceAccountCredentials,
} from '../../../shared/billing/google-play-credentials.loader';
import {
  PLAN_TYPE,
  PLAY_PRODUCT_FAMILY,
  PLAY_PRODUCT_PERSONAL,
} from '../infrastructure/household.schemas';

export interface VerifiedSubscription {
  expiryTimeMillis: number;
  autoRenewing: boolean;
  orderId: string;
  paymentState?: number;
}

export interface VerifiedSubscriptionV2 {
  expiryTimeMillis: number;
  autoRenewing: boolean;
  orderId: string;
  productId: string;
  subscriptionState: string;
  /**
   * Internal AntySpend userId, set as Play Billing's `obfuscatedAccountId` when the purchase was
   * launched (see `PlayBillingClientManager.launchBillingFlow`). Lets RTDN notifications — which
   * otherwise only carry a purchase token, not a user — attribute a purchase to a user without
   * ever needing the client to successfully call verify-purchase first.
   */
  obfuscatedExternalAccountId?: string;
}

@Injectable()
export class PlayBillingVerificationService {
  private readonly logger = new Logger(PlayBillingVerificationService.name);
  private androidPublisher: ReturnType<typeof google.androidpublisher> | null =
    null;

  constructor(private readonly config: ConfigService) {}

  private getClient() {
    if (this.androidPublisher) {
      return this.androidPublisher;
    }

    let credentials: Record<string, unknown>;
    try {
      credentials = loadGooglePlayServiceAccountCredentials({
        serviceAccountJsonBase64: this.config.get<string>(
          'googlePlay.serviceAccountJsonBase64',
        ),
        serviceAccountJson: this.config.get<string>(
          'googlePlay.serviceAccountJson',
        ),
      });
    } catch (error) {
      if (error instanceof GooglePlayCredentialsError) {
        throw new InternalServerErrorException(error.code);
      }
      this.logger.error('Failed to load Google Play service account credentials');
      throw new InternalServerErrorException(
        'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID',
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    this.androidPublisher = google.androidpublisher({ version: 'v3', auth });
    return this.androidPublisher;
  }

  /**
   * Google Play's purchase data can be briefly eventually-consistent right after a purchase is
   * made (an immediate `subscriptionsv2.get` can return no line items — surfacing here as
   * `INVALID_PURCHASE` — or the API can return a transient 5xx/network error). A few short
   * retries absorb that window; a genuinely invalid token just fails the same way each attempt.
   */
  private async withTransientRetry<T>(operation: () => Promise<T>): Promise<T> {
    const delaysMs = [300, 800];
    let lastError: unknown;
    for (let attempt = 0; attempt <= delaysMs.length; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < delaysMs.length) {
          await new Promise((resolve) => setTimeout(resolve, delaysMs[attempt]));
        }
      }
    }
    throw lastError;
  }

  async verifySubscriptionV2(
    purchaseToken: string,
  ): Promise<VerifiedSubscriptionV2> {
    const packageName = this.config.get<string>('googlePlay.packageName');
    if (!packageName) {
      throw new InternalServerErrorException(
        'GOOGLE_PLAY_PACKAGE_NAME_NOT_CONFIGURED',
      );
    }

    const client = this.getClient();
    const data = await this.withTransientRetry(async () => {
      const response = await client.purchases.subscriptionsv2.get({
        packageName,
        token: purchaseToken,
      });
      if (!response.data.lineItems?.[0]?.expiryTime) {
        throw new BadRequestException('INVALID_PURCHASE');
      }
      return response.data;
    });

    const lineItem = data.lineItems![0];
    const expiryTimeMillis = new Date(lineItem.expiryTime!).getTime();
    if (Number.isNaN(expiryTimeMillis)) {
      throw new BadRequestException('INVALID_PURCHASE');
    }

    return {
      expiryTimeMillis,
      autoRenewing: lineItem.autoRenewingPlan?.autoRenewEnabled ?? false,
      orderId: data.latestOrderId ?? '',
      productId: lineItem.productId ?? '',
      subscriptionState: data.subscriptionState ?? '',
      obfuscatedExternalAccountId:
        data.externalAccountIdentifiers?.obfuscatedExternalAccountId ??
        undefined,
    };
  }

  async verifySubscription(
    purchaseToken: string,
    productId: string,
  ): Promise<VerifiedSubscription> {
    try {
      const v2 = await this.verifySubscriptionV2(purchaseToken);
      if (v2.productId && v2.productId !== productId) {
        throw new BadRequestException('PRODUCT_ID_MISMATCH');
      }
      return {
        expiryTimeMillis: v2.expiryTimeMillis,
        autoRenewing: v2.autoRenewing,
        orderId: v2.orderId,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.warn(
        'subscriptionsv2.get failed; falling back to subscriptions.get',
        error,
      );
    }

    const packageName = this.config.get<string>('googlePlay.packageName');
    if (!packageName) {
      throw new InternalServerErrorException(
        'GOOGLE_PLAY_PACKAGE_NAME_NOT_CONFIGURED',
      );
    }

    const client = this.getClient();
    const data = await this.withTransientRetry(async () => {
      const response = await client.purchases.subscriptions.get({
        packageName,
        subscriptionId: productId,
        token: purchaseToken,
      });
      if (!response.data.expiryTimeMillis) {
        throw new BadRequestException('INVALID_PURCHASE');
      }
      return response.data;
    });

    return {
      expiryTimeMillis: Number(data.expiryTimeMillis),
      autoRenewing: data.autoRenewing ?? false,
      orderId: data.orderId ?? '',
      paymentState: data.paymentState ?? undefined,
    };
  }

  productIdToPlanType(productId: string): string {
    if (productId === PLAY_PRODUCT_PERSONAL) {
      return PLAN_TYPE.PERSONAL;
    }
    if (productId === PLAY_PRODUCT_FAMILY) {
      return PLAN_TYPE.FAMILY;
    }
    throw new BadRequestException('UNKNOWN_PRODUCT_ID');
  }
}
