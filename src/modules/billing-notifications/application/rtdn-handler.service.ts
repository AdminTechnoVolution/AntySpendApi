import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntitlementsService } from '../../households/application/entitlements.service';
import {
  BillingNotificationEvent,
  BillingNotificationEventDocument,
} from '../infrastructure/billing-notification-event.schema';
import { RtdnDecoderService } from './rtdn-decoder.service';
import type { PubSubPushBody } from './rtdn.types';

@Injectable()
export class RtdnHandlerService {
  private readonly logger = new Logger(RtdnHandlerService.name);

  constructor(
    private readonly decoder: RtdnDecoderService,
    private readonly entitlementsService: EntitlementsService,
    @InjectModel(BillingNotificationEvent.name)
    private readonly eventModel: Model<BillingNotificationEventDocument>,
  ) {}

  async handlePush(body: PubSubPushBody): Promise<void> {
    const { messageId, notification } = this.decoder.decodePushBody(body);

    const inserted = await this.tryRecordEvent({
      messageId,
      purchaseToken: notification.subscriptionNotification?.purchaseToken,
      notificationType:
        notification.subscriptionNotification?.notificationType,
      rawPayload: body as Record<string, unknown>,
    });
    if (!inserted) {
      this.logger.log(`Duplicate RTDN message ${messageId}, skipping`);
      return;
    }

    const subNotification = notification.subscriptionNotification;
    if (!subNotification?.purchaseToken || !subNotification.subscriptionId) {
      this.logger.log(
        `RTDN message ${messageId} has no subscriptionNotification; recorded only`,
      );
      return;
    }

    await this.entitlementsService.syncEntitlementFromPlayByToken(
      subNotification.purchaseToken,
      subNotification.subscriptionId,
      subNotification.notificationType,
    );
  }

  private async tryRecordEvent(params: {
    messageId: string;
    purchaseToken?: string;
    notificationType?: number;
    rawPayload: Record<string, unknown>;
  }): Promise<boolean> {
    try {
      await this.eventModel.create({
        messageId: params.messageId,
        purchaseToken: params.purchaseToken,
        notificationType: params.notificationType,
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
