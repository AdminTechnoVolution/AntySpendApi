import { HydratedDocument } from 'mongoose';
export declare class SyncMetadata {
    userId: string;
    serverVersion: number;
    lastUpdatedAtMillis: number;
}
export type SyncMetadataDocument = HydratedDocument<SyncMetadata>;
export declare const SyncMetadataSchema: import("mongoose").Schema<SyncMetadata, import("mongoose").Model<SyncMetadata, any, any, any, any, any, SyncMetadata>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SyncMetadata, import("mongoose").Document<unknown, {}, SyncMetadata, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SyncMetadata & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<string, SyncMetadata, import("mongoose").Document<unknown, {}, SyncMetadata, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SyncMetadata & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    serverVersion?: import("mongoose").SchemaDefinitionProperty<number, SyncMetadata, import("mongoose").Document<unknown, {}, SyncMetadata, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SyncMetadata & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, SyncMetadata, import("mongoose").Document<unknown, {}, SyncMetadata, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SyncMetadata & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, SyncMetadata>;
