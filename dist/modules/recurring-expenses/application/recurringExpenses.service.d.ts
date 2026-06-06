import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { RecurringExpenseDocument } from '../../../shared/database/entity.schemas';
export declare class RecurringExpenseService extends BaseEntityService {
    constructor(model: Model<RecurringExpenseDocument>);
    markPaid(userId: string, id: string): Promise<any>;
    private addMonths;
}
