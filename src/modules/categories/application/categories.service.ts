import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { Category, CategoryDocument } from '../../../shared/database/entity.schemas';

@Injectable()
export class CategoryService extends BaseEntityService {
  constructor(@InjectModel(Category.name) model: Model<CategoryDocument>) {
    super(model, 'Category');
  }
}
