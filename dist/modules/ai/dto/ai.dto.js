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
exports.LeakAnalysisRequestDto = exports.LeakAnalysisRecurringDto = exports.LeakAnalysisTransactionDto = exports.ExpenseExtractionRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ExpenseExtractionRequestDto {
    text;
    defaultCurrencyCode;
    userLanguage;
}
exports.ExpenseExtractionRequestDto = ExpenseExtractionRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExpenseExtractionRequestDto.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseExtractionRequestDto.prototype, "defaultCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseExtractionRequestDto.prototype, "userLanguage", void 0);
class LeakAnalysisTransactionDto {
    id;
    title;
    amount;
    currencyCode;
    categoryName;
    daysAgo;
    occurredAtMillis;
}
exports.LeakAnalysisTransactionDto = LeakAnalysisTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeakAnalysisTransactionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeakAnalysisTransactionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeakAnalysisTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeakAnalysisTransactionDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeakAnalysisTransactionDto.prototype, "categoryName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeakAnalysisTransactionDto.prototype, "daysAgo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeakAnalysisTransactionDto.prototype, "occurredAtMillis", void 0);
class LeakAnalysisRecurringDto {
    id;
    title;
    amount;
    currencyCode;
    categoryName;
    frequency;
    isActive;
}
exports.LeakAnalysisRecurringDto = LeakAnalysisRecurringDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeakAnalysisRecurringDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeakAnalysisRecurringDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeakAnalysisRecurringDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeakAnalysisRecurringDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeakAnalysisRecurringDto.prototype, "categoryName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeakAnalysisRecurringDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LeakAnalysisRecurringDto.prototype, "isActive", void 0);
class LeakAnalysisRequestDto {
    month;
    userLanguage;
    transactions;
    recurringExpenses;
    primaryCurrencyCode;
    microExpenseThresholdPrimaryMinor;
}
exports.LeakAnalysisRequestDto = LeakAnalysisRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Month in YYYY-MM format; defaults to current month' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeakAnalysisRequestDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeakAnalysisRequestDto.prototype, "userLanguage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [LeakAnalysisTransactionDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LeakAnalysisTransactionDto),
    __metadata("design:type", Array)
], LeakAnalysisRequestDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [LeakAnalysisRecurringDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LeakAnalysisRecurringDto),
    __metadata("design:type", Array)
], LeakAnalysisRequestDto.prototype, "recurringExpenses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeakAnalysisRequestDto.prototype, "primaryCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeakAnalysisRequestDto.prototype, "microExpenseThresholdPrimaryMinor", void 0);
//# sourceMappingURL=ai.dto.js.map