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
exports.ExchangeRatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../shared/auth/jwt-auth.guard");
const exchange_rates_dto_1 = require("../../../shared/swagger/exchange-rates.dto");
const common_responses_decorator_1 = require("../../../shared/swagger/common-responses.decorator");
const swagger_constants_1 = require("../../../shared/swagger/swagger.constants");
const exchange_rates_service_1 = require("../application/exchange-rates.service");
let ExchangeRatesController = class ExchangeRatesController {
    exchangeRatesService;
    constructor(exchangeRatesService) {
        this.exchangeRatesService = exchangeRatesService;
    }
    getLatest() {
        return this.exchangeRatesService.getLatest();
    }
};
exports.ExchangeRatesController = ExchangeRatesController;
__decorate([
    (0, common_1.Get)('latest'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(swagger_constants_1.BEARER_AUTH_SCHEME),
    (0, swagger_1.ApiOperation)({
        summary: 'Get latest USD-based exchange rates (Mongo cache, 1 snapshot/día UTC)',
    }),
    (0, swagger_1.ApiOkResponse)({ type: exchange_rates_dto_1.ExchangeRatesResponseDto }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "getLatest", null);
exports.ExchangeRatesController = ExchangeRatesController = __decorate([
    (0, swagger_1.ApiTags)('exchange-rates'),
    (0, common_1.Controller)('exchange-rates'),
    __metadata("design:paramtypes", [exchange_rates_service_1.ExchangeRatesService])
], ExchangeRatesController);
//# sourceMappingURL=exchange-rates.controller.js.map