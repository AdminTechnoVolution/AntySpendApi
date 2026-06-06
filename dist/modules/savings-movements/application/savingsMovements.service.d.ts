import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { SavingsMovementDocument } from '../../../shared/database/entity.schemas';
export declare class SavingsMovementService extends BaseEntityService {
    constructor(model: Model<SavingsMovementDocument>);
}
