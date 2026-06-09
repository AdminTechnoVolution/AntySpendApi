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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrenciesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const entity_dto_1 = require("../../../shared/swagger/entity.dto");
const currencies_service_1 = require("../application/currencies.service");
let CurrenciesController = class CurrenciesController {
    currenciesService;
    constructor(currenciesService) {
        this.currenciesService = currenciesService;
    }
    findAll() {
        return this.currenciesService.findAll();
    }
    seed() {
        return this.currenciesService.seed().then(() => ({ seeded: true }));
    }
};
exports.CurrenciesController = CurrenciesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List global currency catalog' }),
    (0, swagger_1.ApiOkResponse)({ type: entity_dto_1.CurrencyDto, isArray: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CurrenciesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('seed'),
    (0, swagger_1.ApiOperation)({ summary: 'Re-run currency seed (idempotent)' }),
    (0, swagger_1.ApiOkResponse)({ type: entity_dto_1.CurrencySeedResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CurrenciesController.prototype, "seed", null);
exports.CurrenciesController = CurrenciesController = __decorate([
    (0, swagger_1.ApiTags)('currencies'),
    (0, common_1.Controller)('currencies'),
    __metadata("design:paramtypes", [currencies_service_1.CurrenciesService])
], CurrenciesController);
