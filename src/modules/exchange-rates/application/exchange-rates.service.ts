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

/** The server's local clock defines the three refresh windows. */
function snapshotKey(now: Date): string {
  const hour = now.getHours();
  const slot = hour >= 18 ? '18' : hour >= 12 ? '12' : hour >= 6 ? '06' : null;
  const day = new Date(now);
  if (slot === null) day.setDate(day.getDate() - 1);
  const keySlot = slot ?? '18';
  const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  return `${date}-${keySlot}`;
}

function nextSlotEndMillis(now: Date): number {
  const end = new Date(now);
  const hour = now.getHours();
  if (hour < 6) end.setHours(6, 0, 0, 0);
  else if (hour < 12) end.setHours(12, 0, 0, 0);
  else if (hour < 18) end.setHours(18, 0, 0, 0);
  else { end.setDate(end.getDate() + 1); end.setHours(6, 0, 0, 0); }
  return end.getTime() - 1;
}

@Injectable()
export class ExchangeRatesService {
  private readonly pending = new Map<string, Promise<Awaited<ReturnType<ExchangeRatesService['staleFallback']>>>>();
  private readonly attempted = new Set<string>();

  constructor(
    @InjectModel(ExchangeRateSnapshot.name)
    private readonly snapshotModel: Model<ExchangeRateSnapshotDocument>,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getLatest() {
    const now = Date.now();
    const slotKey = snapshotKey(new Date(now));

    const slotSnapshot = await this.snapshotModel
      .findOne({ baseCurrency: 'USD', snapshotDate: slotKey })
      .lean();

    if (slotSnapshot) {
      return {
        base: slotSnapshot.baseCurrency,
        rates: slotSnapshot.rates,
        fetchedAtMillis: slotSnapshot.fetchedAtMillis,
        cached: true,
      };
    }

    if (new Date(now).getHours() < 6) return this.staleFallback(now);
    const pending = this.pending.get(slotKey);
    if (pending) return pending;
    if (this.attempted.has(slotKey)) return this.staleFallback(now);
    this.attempted.add(slotKey);
    const request = this.fetchSlot(slotKey, now);
    this.pending.set(slotKey, request);
    try { return await request; }
    finally { this.pending.delete(slotKey); }
  }

  private async fetchSlot(slotKey: string, now: number) {
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
        { baseCurrency, snapshotDate: slotKey },
        {
          $set: {
            rates: response.data.conversion_rates,
            fetchedAtMillis: now,
            expiresAtMillis: nextSlotEndMillis(new Date(now)),
          },
          $setOnInsert: {
            baseCurrency,
            snapshotDate: slotKey,
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
