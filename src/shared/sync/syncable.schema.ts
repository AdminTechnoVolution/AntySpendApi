import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export interface ISyncableEntity {
  id: string;
  userId: string;
  createdAtMillis: number;
  updatedAtMillis: number;
  deletedAtMillis?: number;
  clientUpdatedAtMillis?: number;
  deviceId?: string;
}

export function syncableIndexes(schema: MongooseSchema) {
  schema.index({ userId: 1, id: 1 }, { unique: true });
  schema.index({ userId: 1, updatedAtMillis: 1 });
}

@Schema({ strict: true })
export class SyncableEntity implements ISyncableEntity {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  createdAtMillis!: number;

  @Prop({ required: true })
  updatedAtMillis!: number;

  @Prop()
  deletedAtMillis?: number;

  @Prop()
  clientUpdatedAtMillis?: number;

  @Prop()
  deviceId?: string;
}

export type SyncableDocument = HydratedDocument<SyncableEntity>;

export function toPlainSyncable(doc: Record<string, unknown>) {
  const { _id, __v, ...rest } = doc;
  return rest;
}
