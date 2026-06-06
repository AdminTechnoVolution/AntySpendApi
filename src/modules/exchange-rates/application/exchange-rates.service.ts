import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import {
  ExchangeRateSnapshot,
  ExchangeRateSnapshotDocument,
} from '../../../shared/database/entity.schemas';

function snapshotDateForMillis(millis: number): string {
  return new Date(millis).toISOString().slice(0, 10);
}

function endOfUtcDayMillis(millis: number): number {
  const date = new Date(millis);
  return (
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ) - 1
  );
}

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectModel(ExchangeRateSnapshot.name)
    private readonly snapshotModel: Model<ExchangeRateSnapshotDocument>,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getLatest() {
    const now = Date.now();
    const todayUtc = snapshotDateForMillis(now);

    const todaysSnapshot = await this.snapshotModel
      .findOne({ baseCurrency: 'USD', snapshotDate: todayUtc })
      .lean();

    if (todaysSnapshot) {
      return {
        base: todaysSnapshot.baseCurrency,
        rates: todaysSnapshot.rates,
        fetchedAtMillis: todaysSnapshot.fetchedAtMillis,
        cached: true,
      };
    }

    const token = this.config.get<string>('exchangeRate.apiToken')?.trim() ?? '';
    if (!token) {
      return this.staleFallback(now);
    }

    try {
      const url = `https://v6.exchangerate-api.com/v6/${token}/latest/USD`;
      const response = await firstValueFrom(
        this.http.get<{ result: string; conversion_rates: Record<string, number> }>(
          url,
          { timeout: 15000 },
        ),
      );

      if (response.data.result !== 'success') {
        throw new Error('ExchangeRate-API request failed');
      }

      const baseCurrency = 'USD';
      const snapshot = await this.snapshotModel.findOneAndUpdate(
        { baseCurrency, snapshotDate: todayUtc },
        {
          $set: {
            rates: response.data.conversion_rates,
            fetchedAtMillis: now,
            expiresAtMillis: endOfUtcDayMillis(now),
          },
          $setOnInsert: {
            baseCurrency,
            snapshotDate: todayUtc,
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      );

      return {
        base: snapshot.baseCurrency,
        rates: snapshot.rates,
        fetchedAtMillis: snapshot.fetchedAtMillis,
        cached: false,
      };
    } catch {
      return this.staleFallback(now);
    }
  }

  private async staleFallback(now: number) {
    const stale = await this.snapshotModel
      .findOne()
      .sort({ fetchedAtMillis: -1 })
      .lean();

    if (stale) {
      return {
        base: stale.baseCurrency,
        rates: stale.rates,
        fetchedAtMillis: stale.fetchedAtMillis,
        cached: true,
        stale: true,
      };
    }

    return { base: 'USD', rates: {}, fetchedAtMillis: now, cached: false };
  }
}
