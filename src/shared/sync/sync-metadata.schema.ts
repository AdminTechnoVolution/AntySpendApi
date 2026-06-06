import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'sync_metadata', timestamps: true })
export class SyncMetadata {
  @Prop({ required: true, unique: true })
  userId!: string;

  @Prop({ required: true, default: 0 })
  serverVersion!: number;

  @Prop({ required: true, default: Date.now })
  lastUpdatedAtMillis!: number;
}

export type SyncMetadataDocument = HydratedDocument<SyncMetadata>;
export const SyncMetadataSchema = SchemaFactory.createForClass(SyncMetadata);
