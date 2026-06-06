import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { MerchantDocument } from '../../../shared/database/entity.schemas';
export declare class MerchantService extends BaseEntityService {
    constructor(model: Model<MerchantDocument>);
}
