import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { WalletDocument } from '../../../shared/database/entity.schemas';
export declare class WalletService extends BaseEntityService {
    constructor(model: Model<WalletDocument>);
}
