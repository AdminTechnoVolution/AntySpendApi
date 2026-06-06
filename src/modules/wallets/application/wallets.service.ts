import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import { Wallet, WalletDocument } from '../../../shared/database/entity.schemas';

@Injectable()
export class WalletService extends BaseEntityService {
  constructor(@InjectModel(Wallet.name) model: Model<WalletDocument>) {
    super(model, 'Wallet');
  }
}
