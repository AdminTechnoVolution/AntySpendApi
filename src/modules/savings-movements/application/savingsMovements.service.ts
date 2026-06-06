import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { SavingsMovement, SavingsMovementDocument } from '../../../shared/database/entity.schemas';

@Injectable()
export class SavingsMovementService extends BaseEntityService {
  constructor(@InjectModel(SavingsMovement.name) model: Model<SavingsMovementDocument>) {
    super(model, 'SavingsMovement');
  }
}
