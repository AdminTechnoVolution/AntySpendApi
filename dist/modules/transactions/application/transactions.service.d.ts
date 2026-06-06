import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { TransactionDocument } from '../../../shared/database/entity.schemas';
export interface TransactionFilters {
    fromMillis?: number;
    toMillis?: number;
    categoryId?: string;
}
export declare class TransactionService extends BaseEntityService {
    constructor(model: Model<TransactionDocument>);
    findFiltered(userId: string, filters: TransactionFilters): Promise<any[]>;
}
