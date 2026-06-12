import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CURRENCY_SEED } from '../../../shared/constants/catalog.constants';
import {
  Currency,
  CurrencyDocument,
} from '../../../shared/database/entity.schemas';
import { SettingsService } from '../../settings/application/settings.service';
import { EntitlementsService } from '../../households/application/entitlements.service';

@Injectable()
export class CurrenciesService implements OnModuleInit {
  constructor(
    @InjectModel(Currency.name)
    private readonly currencyModel: Model<CurrencyDocument>,
    private readonly settingsService: SettingsService,
    private readonly entitlementsService: EntitlementsService,
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

  async findVisibleForUser(userId: string) {
    const entitlement = await this.entitlementsService.getMyEntitlement(userId);
    if (entitlement.premiumAccessActive) {
      return this.findAll();
    }

    const settings = await this.settingsService.findByUserId(userId);
    const primaryCurrencyCode = settings?.primaryCurrencyCode?.trim().toUpperCase() || 'USD';
    const primaryCurrency = await this.currencyModel.findOne({ code: primaryCurrencyCode }).lean();
    return primaryCurrency ? [primaryCurrency] : [];
  }
}
