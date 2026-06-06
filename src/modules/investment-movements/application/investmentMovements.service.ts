import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { InvestmentMovement, InvestmentMovementDocument } from '../../../shared/database/entity.schemas';

@Injectable()
export class InvestmentMovementService extends BaseEntityService {
  constructor(@InjectModel(InvestmentMovement.name) model: Model<InvestmentMovementDocument>) {
    super(model, 'InvestmentMovement');
  }
}
