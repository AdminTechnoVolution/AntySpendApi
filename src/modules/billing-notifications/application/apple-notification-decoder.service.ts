import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AppleBillingVerificationService,
  AppleTransactionPayload,
} from '../../households/application/apple-billing-verification.service';
import type {
  AppStoreNotificationEnvelope,
  AppStoreNotificationRequestBody,
  AppStoreRenewalInfo,
} from './apple-notification.types';

export interface DecodedAppleNotification {
  notificationUUID: string;
  notificationType: string;
  subtype?: string;
  transaction?: AppleTransactionPayload;
  renewalInfo?: AppStoreRenewalInfo;
}

/**
 * Every field in an App Store Server Notification is inside a nested, independently-signed JWS
 * (the envelope itself, then `data.signedTransactionInfo` and `data.signedRenewalInfo` each
 * carry their own certificate chain) — so decoding one means verifying three signatures, not one.
 */
@Injectable()
export class AppleNotificationDecoderService {
  constructor(private readonly appleBilling: AppleBillingVerificationService) {}

  async decode(body: AppStoreNotificationRequestBody): Promise<DecodedAppleNotification> {
    if (!body?.signedPayload) {
      throw new BadRequestException('MISSING_SIGNED_PAYLOAD');
    }
    const envelope = await this.appleBilling.verifyAndDecodeSignedPayload<AppStoreNotificationEnvelope>(
      body.signedPayload,
    );

    const transaction = envelope.data?.signedTransactionInfo
      ? await this.appleBilling.verifyAndDecodeSignedPayload<AppleTransactionPayload>(
          envelope.data.signedTransactionInfo,
        )
      : undefined;
    const renewalInfo = envelope.data?.signedRenewalInfo
      ? await this.appleBilling.verifyAndDecodeSignedPayload<AppStoreRenewalInfo>(
          envelope.data.signedRenewalInfo,
        )
      : undefined;

    return {
      notificationUUID: envelope.notificationUUID,
      notificationType: envelope.notificationType,
      subtype: envelope.subtype,
      transaction,
      renewalInfo,
    };
  }
}
