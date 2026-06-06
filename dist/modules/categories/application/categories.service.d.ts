import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { CategoryDocument } from '../../../shared/database/entity.schemas';
export declare class CategoryService extends BaseEntityService {
    constructor(model: Model<CategoryDocument>);
}
