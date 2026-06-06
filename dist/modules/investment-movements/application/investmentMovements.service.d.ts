import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { InvestmentMovementDocument } from '../../../shared/database/entity.schemas';
export declare class InvestmentMovementService extends BaseEntityService {
    constructor(model: Model<InvestmentMovementDocument>);
}
