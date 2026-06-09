"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRatesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const mongoose_2 = require("mongoose");
const rxjs_1 = require("rxjs");
const entity_schemas_1 = require("../../../shared/database/entity.schemas");
function snapshotDateForMillis(millis) {
    return new Date(millis).toISOString().slice(0, 10);
}
function endOfUtcDayMillis(millis) {
    const date = new Date(millis);
    return (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0) - 1);
}
let ExchangeRatesService = class ExchangeRatesService {
    snapshotModel;
    http;
    config;
    constructor(snapshotModel, http, config) {
        this.snapshotModel = snapshotModel;
        this.http = http;
        this.config = config;
    }
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
        const token = this.config.get('exchangeRate.apiToken')?.trim() ?? '';
        if (!token) {
            return this.staleFallback(now);
        }
        try {
            const url = `https://v6.exchangerate-api.com/v6/${token}/latest/USD`;
            const response = await (0, rxjs_1.firstValueFrom)(this.http.get(url, { timeout: 15000 }));
            if (response.data.result !== 'success') {
                throw new Error('ExchangeRate-API request failed');
            }
            const baseCurrency = 'USD';
            const snapshot = await this.snapshotModel.findOneAndUpdate({ baseCurrency, snapshotDate: todayUtc }, {
                $set: {
                    rates: response.data.conversion_rates,
                    fetchedAtMillis: now,
                    expiresAtMillis: endOfUtcDayMillis(now),
                },
                $setOnInsert: {
                    baseCurrency,
                    snapshotDate: todayUtc,
                },
            }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
            return {
                base: snapshot.baseCurrency,
                rates: snapshot.rates,
                fetchedAtMillis: snapshot.fetchedAtMillis,
                cached: false,
            };
        }
        catch {
            return this.staleFallback(now);
        }
    }
    async staleFallback(now) {
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
};
exports.ExchangeRatesService = ExchangeRatesService;
exports.ExchangeRatesService = ExchangeRatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(entity_schemas_1.ExchangeRateSnapshot.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        axios_1.HttpService,
        config_1.ConfigService])
], ExchangeRatesService);
