import { ExchangeRatesService } from '../application/exchange-rates.service';
export declare class ExchangeRatesController {
    private readonly exchangeRatesService;
    constructor(exchangeRatesService: ExchangeRatesService);
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
}
