import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { Investment, InvestmentDocument } from '../../../shared/database/entity.schemas';

@Injectable()
export class InvestmentService extends BaseEntityService {
  constructor(@InjectModel(Investment.name) model: Model<InvestmentDocument>) {
    super(model, 'Investment');
  }
}
