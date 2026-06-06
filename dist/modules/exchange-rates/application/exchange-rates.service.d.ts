import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { ExchangeRateSnapshotDocument } from '../../../shared/database/entity.schemas';
export declare class ExchangeRatesService {
    private readonly snapshotModel;
    private readonly http;
    private readonly config;
    constructor(snapshotModel: Model<ExchangeRateSnapshotDocument>, http: HttpService, config: ConfigService);
    getLatest(): Promise<{
        base: string;
        rates: Record<string, number>;
        fetchedAtMillis: number;
        cached: boolean;
        stale: boolean;
    } | {
        base: string;
        rates: {};
        fetchedAtMillis: number;
        cached: boolean;
        stale?: undefined;
    }>;
    private staleFallback;
}
