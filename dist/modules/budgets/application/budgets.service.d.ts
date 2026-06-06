import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { BudgetDocument } from '../../../shared/database/entity.schemas';
export declare class BudgetService extends BaseEntityService {
    constructor(model: Model<BudgetDocument>);
}
