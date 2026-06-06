import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CURRENCY_SEED } from '../../../shared/constants/catalog.constants';
import {
  Currency,
  CurrencyDocument,
} from '../../../shared/database/entity.schemas';

@Injectable()
export class CurrenciesService implements OnModuleInit {
  constructor(
    @InjectModel(Currency.name)
    private readonly currencyModel: Model<CurrencyDocument>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const now = Date.now();
    for (const item of CURRENCY_SEED) {
      await this.currencyModel.updateOne(
        { code: item.code },
        {
          $setOnInsert: {
            code: item.code,
            minorUnits: item.minorUnits,
            displayLabel: item.displayLabel,
            createdAtMillis: now,
            updatedAtMillis: now,
          },
        },
        { upsert: true },
      );
    }
  }

  async findAll() {
    return this.currencyModel.find().sort({ code: 1 }).lean();
  }
}
