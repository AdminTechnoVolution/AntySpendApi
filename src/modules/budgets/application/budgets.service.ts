import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { Budget, BudgetDocument } from '../../../shared/database/entity.schemas';

@Injectable()
export class BudgetService extends BaseEntityService {
  constructor(@InjectModel(Budget.name) model: Model<BudgetDocument>) {
    super(model, 'Budget');
  }
}
