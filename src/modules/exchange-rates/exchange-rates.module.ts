import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExchangeRateSnapshot,
  ExchangeRateSnapshotSchema,
} from '../../shared/database/entity.schemas';
import { ExchangeRatesService } from './application/exchange-rates.service';
import { ExchangeRatesController } from './presentation/exchange-rates.controller';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: ExchangeRateSnapshot.name, schema: ExchangeRateSnapshotSchema },
    ]),
  ],
  controllers: [ExchangeRatesController],
  providers: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
