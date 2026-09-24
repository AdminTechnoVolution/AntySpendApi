import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'billing_notification_events', strict: true })
export class BillingNotificationEvent {
  @Prop({ required: true, unique: true })
  messageId!: string;

  @Prop()
  purchaseToken?: string;

  @Prop()
  notificationType?: number;

  /** Apple's notification types are strings (e.g. "DID_RENEW"), unlike Play's numeric codes. */
  @Prop()
  appleNotificationType?: string;

  @Prop({ required: true })
  processedAtMillis!: number;

  @Prop({ type: Object })
  rawPayload?: Record<string, unknown>;
}

export type BillingNotificationEventDocument =
  HydratedDocument<BillingNotificationEvent>;
export const BillingNotificationEventSchema = SchemaFactory.createForClass(
  BillingNotificationEvent,
);
