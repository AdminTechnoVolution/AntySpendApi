import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { SavingsPlanDocument } from '../../../shared/database/entity.schemas';
export declare class SavingsPlanService extends BaseEntityService {
    constructor(model: Model<SavingsPlanDocument>);
}
