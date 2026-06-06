import { Model } from 'mongoose';
export declare function newEntityId(): string;
export interface CrudWriteOptions {
    deviceId?: string;
    idempotencyKey?: string;
}
type AnyModel = Model<any>;
export declare class SyncableCrudService {
    private readonly model;
    private readonly entityName;
    constructor(model: AnyModel, entityName: string);
    findAll(userId: string, includeDeleted?: boolean): Promise<any[]>;
    findOne(userId: string, id: string): Promise<any>;
    create(userId: string, data: Record<string, unknown>, options?: CrudWriteOptions): Promise<any>;
    update(userId: string, id: string, data: Record<string, unknown>, options?: CrudWriteOptions): Promise<any>;
    softDelete(userId: string, id: string, deviceId?: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    getModel(): AnyModel;
}
export {};
