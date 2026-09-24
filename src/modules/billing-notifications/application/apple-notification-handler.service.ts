import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntitlementsService } from '../../households/application/entitlements.service';
import {
  BillingNotificationEvent,
  BillingNotificationEventDocument,
} from '../infrastructure/billing-notification-event.schema';
import { AppleNotificationDecoderService } from './apple-notification-decoder.service';
import type { AppStoreNotificationRequestBody } from './apple-notification.types';

@Injectable()
export class AppleNotificationHandlerService {
  private readonly logger = new Logger(AppleNotificationHandlerService.name);

  constructor(
    private readonly decoder: AppleNotificationDecoderService,
    private readonly entitlementsService: EntitlementsService,
    @InjectModel(BillingNotificationEvent.name)
    private readonly eventModel: Model<BillingNotificationEventDocument>,
  ) {}

  async handleNotification(body: AppStoreNotificationRequestBody): Promise<void> {
    const decoded = await this.decoder.decode(body);

    const inserted = await this.tryRecordEvent({
      messageId: decoded.notificationUUID,
      purchaseToken: decoded.transaction?.originalTransactionId,
      appleNotificationType: decoded.notificationType,
      rawPayload: decoded as unknown as Record<string, unknown>,
    });
    if (!inserted) {
      this.logger.log(`Duplicate App Store notification ${decoded.notificationUUID}, skipping`);
      return;
    }

    if (!decoded.transaction) {
      this.logger.log(
        `App Store notification ${decoded.notificationUUID} (${decoded.notificationType}) carried no transaction; recorded only`,
      );
      return;
    }

    const autoRenewStatus = decoded.renewalInfo?.autoRenewStatus ?? 0;
    await this.entitlementsService.syncEntitlementFromAppleNotification(
      decoded.transaction.originalTransactionId,
      decoded.transaction.productId,
      decoded.transaction.expiresDate ?? decoded.transaction.purchaseDate,
      autoRenewStatus,
      decoded.notificationType,
    );
  }

  private async tryRecordEvent(params: {
    messageId: string;
    purchaseToken?: string;
    appleNotificationType?: string;
    rawPayload: Record<string, unknown>;
  }): Promise<boolean> {
    try {
      await this.eventModel.create({
        messageId: params.messageId,
        purchaseToken: params.purchaseToken,
        appleNotificationType: params.appleNotificationType,
        processedAtMillis: Date.now(),
        rawPayload: params.rawPayload,
      });
      return true;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        return false;
      }
      throw error;
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
