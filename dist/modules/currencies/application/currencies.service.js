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
exports.CurrenciesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const catalog_constants_1 = require("../../../shared/constants/catalog.constants");
const entity_schemas_1 = require("../../../shared/database/entity.schemas");
let CurrenciesService = class CurrenciesService {
    currencyModel;
    constructor(currencyModel) {
        this.currencyModel = currencyModel;
    }
    async onModuleInit() {
        await this.seed();
    }
    async seed() {
        const now = Date.now();
        for (const item of catalog_constants_1.CURRENCY_SEED) {
            await this.currencyModel.updateOne({ code: item.code }, {
                $setOnInsert: {
                    code: item.code,
                    minorUnits: item.minorUnits,
                    displayLabel: item.displayLabel,
                    createdAtMillis: now,
                    updatedAtMillis: now,
                },
            }, { upsert: true });
        }
    }
    async findAll() {
        return this.currencyModel.find().sort({ code: 1 }).lean();
    }
};
exports.CurrenciesService = CurrenciesService;
exports.CurrenciesService = CurrenciesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(entity_schemas_1.Currency.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CurrenciesService);
//# sourceMappingURL=currencies.service.js.map