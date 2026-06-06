import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { Merchant, MerchantDocument } from '../../../shared/database/entity.schemas';

@Injectable()
export class MerchantService extends BaseEntityService {
  constructor(@InjectModel(Merchant.name) model: Model<MerchantDocument>) {
    super(model, 'Merchant');
  }
}
