import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
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

    const jsonPath = this.config.get<string>('googlePlay.serviceAccountJson');
    if (!jsonPath) {
      throw new InternalServerErrorException(
        'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_NOT_CONFIGURED',
      );
    }

    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(readFileSync(jsonPath, 'utf8')) as Record<
        string,
        unknown
      >;
    } catch (error) {
      this.logger.error('Failed to read Google Play service account JSON', error);
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

  async verifySubscription(
    purchaseToken: string,
    productId: string,
  ): Promise<VerifiedSubscription> {
    const packageName = this.config.get<string>('googlePlay.packageName');
    if (!packageName) {
      throw new InternalServerErrorException(
        'GOOGLE_PLAY_PACKAGE_NAME_NOT_CONFIGURED',
      );
    }

    const client = this.getClient();
    const response = await client.purchases.subscriptions.get({
      packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });

    const data = response.data;
    if (!data.expiryTimeMillis) {
      throw new BadRequestException('INVALID_PURCHASE');
    }

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
