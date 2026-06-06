import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { SavingsPlan, SavingsPlanDocument } from '../../../shared/database/entity.schemas';

@Injectable()
export class SavingsPlanService extends BaseEntityService {
  constructor(@InjectModel(SavingsPlan.name) model: Model<SavingsPlanDocument>) {
    super(model, 'SavingsPlan');
  }
}
