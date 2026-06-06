import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { InvestmentDocument } from '../../../shared/database/entity.schemas';
export declare class InvestmentService extends BaseEntityService {
    constructor(model: Model<InvestmentDocument>);
}
