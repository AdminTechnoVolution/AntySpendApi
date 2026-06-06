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
export declare function syncableIndexes(schema: MongooseSchema): void;
export declare class SyncableEntity implements ISyncableEntity {
    id: string;
    userId: string;
    createdAtMillis: number;
    updatedAtMillis: number;
    deletedAtMillis?: number;
    clientUpdatedAtMillis?: number;
    deviceId?: string;
}
export type SyncableDocument = HydratedDocument<SyncableEntity>;
export declare function toPlainSyncable(doc: Record<string, unknown>): {
    [x: string]: unknown;
};
