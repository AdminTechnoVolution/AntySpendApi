import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Currency,
  CurrencySchema,
} from '../../shared/database/entity.schemas';
import { SettingsModule } from '../settings/settings.module';
import { HouseholdsModule } from '../households/households.module';
import { CurrenciesService } from './application/currencies.service';
import { CurrenciesController } from './presentation/currencies.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Currency.name, schema: CurrencySchema }]),
    SettingsModule,
    HouseholdsModule,
  ],
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}
