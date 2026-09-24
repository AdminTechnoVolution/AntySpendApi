import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HouseholdsModule } from '../households/households.module';
import { PubSubPushAuthGuard } from './application/pubsub-push-auth.guard';
import { RtdnDecoderService } from './application/rtdn-decoder.service';
import { RtdnHandlerService } from './application/rtdn-handler.service';
import {
  BillingNotificationEvent,
  BillingNotificationEventSchema,
} from './infrastructure/billing-notification-event.schema';
import { GooglePlayRtdnController } from './presentation/google-play-rtdn.controller';
import { AppleNotificationDecoderService } from './application/apple-notification-decoder.service';
import { AppleNotificationHandlerService } from './application/apple-notification-handler.service';
import { AppleStoreNotificationsController } from './presentation/apple-store-notifications.controller';

@Module({
  imports: [
    HouseholdsModule,
    MongooseModule.forFeature([
      {
        name: BillingNotificationEvent.name,
        schema: BillingNotificationEventSchema,
      },
    ]),
  ],
  controllers: [GooglePlayRtdnController, AppleStoreNotificationsController],
  providers: [
    PubSubPushAuthGuard,
    RtdnDecoderService,
    RtdnHandlerService,
    AppleNotificationDecoderService,
    AppleNotificationHandlerService,
  ],
})
export class BillingNotificationsModule {}
