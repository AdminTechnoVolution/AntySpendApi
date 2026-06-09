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
exports.ExchangeRatesResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ExchangeRatesResponseDto {
    base;
    rates;
    fetchedAtMillis;
    cached;
}
exports.ExchangeRatesResponseDto = ExchangeRatesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    __metadata("design:type", String)
], ExchangeRatesResponseDto.prototype, "base", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'object',
        additionalProperties: { type: 'number' },
        example: { EUR: 0.92, MXN: 17.1 },
    }),
    __metadata("design:type", Object)
], ExchangeRatesResponseDto.prototype, "rates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ExchangeRatesResponseDto.prototype, "fetchedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'True when served from Mongo cache' }),
    __metadata("design:type", Boolean)
], ExchangeRatesResponseDto.prototype, "cached", void 0);
