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
exports.CurrencySeedResponseDto = exports.CurrencyDto = exports.UpdateUserSettingsDto = exports.UserSettingsDto = exports.UpdateInvestmentMovementDto = exports.CreateInvestmentMovementDto = exports.InvestmentMovementDto = exports.UpdateInvestmentDto = exports.CreateInvestmentDto = exports.InvestmentDto = exports.UpdateSavingsMovementDto = exports.CreateSavingsMovementDto = exports.SavingsMovementDto = exports.UpdateSavingsPlanDto = exports.CreateSavingsPlanDto = exports.SavingsPlanDto = exports.UpdateRecurringExpenseDto = exports.CreateRecurringExpenseDto = exports.RecurringExpenseDto = exports.UpdateBudgetDto = exports.CreateBudgetDto = exports.BudgetDto = exports.TransactionQueryDto = exports.UpdateTransactionDto = exports.CreateTransactionDto = exports.TransactionDto = exports.UpdateMerchantDto = exports.CreateMerchantDto = exports.MerchantDto = exports.UpdateCategoryDto = exports.CreateCategoryDto = exports.CategoryDto = exports.UpdateWalletDto = exports.CreateWalletDto = exports.WalletDto = exports.SyncableFieldsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class SyncableFieldsDto {
    id;
    userId;
    createdAtMillis;
    updatedAtMillis;
    deletedAtMillis;
    clientUpdatedAtMillis;
    deviceId;
}
exports.SyncableFieldsDto = SyncableFieldsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SyncableFieldsDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SyncableFieldsDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SyncableFieldsDto.prototype, "createdAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SyncableFieldsDto.prototype, "updatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], SyncableFieldsDto.prototype, "deletedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], SyncableFieldsDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SyncableFieldsDto.prototype, "deviceId", void 0);
class WalletDto extends SyncableFieldsDto {
    name;
    currencyCode;
    walletType;
    initialBalanceMinor;
    isDefault;
}
exports.WalletDto = WalletDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 'CASH' }),
    __metadata("design:type", String)
], WalletDto.prototype, "walletType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 0 }),
    __metadata("design:type", Number)
], WalletDto.prototype, "initialBalanceMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], WalletDto.prototype, "isDefault", void 0);
class CreateWalletDto {
    id;
    name;
    currencyCode;
    walletType;
    initialBalanceMinor;
    isDefault;
    clientUpdatedAtMillis;
    deviceId;
}
exports.CreateWalletDto = CreateWalletDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'CASH' }),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "walletType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    __metadata("design:type", Number)
], CreateWalletDto.prototype, "initialBalanceMinor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    __metadata("design:type", Boolean)
], CreateWalletDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateWalletDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "deviceId", void 0);
class UpdateWalletDto extends (0, swagger_1.PartialType)(CreateWalletDto) {
}
exports.UpdateWalletDto = UpdateWalletDto;
class CategoryDto extends SyncableFieldsDto {
    key;
    customName;
    type;
    iconName;
    colorHex;
    isDefault;
}
exports.CategoryDto = CategoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "customName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "iconName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "colorHex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], CategoryDto.prototype, "isDefault", void 0);
class CreateCategoryDto {
    id;
    key;
    customName;
    type;
    iconName;
    colorHex;
    isDefault;
    clientUpdatedAtMillis;
    deviceId;
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "customName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "iconName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "colorHex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    __metadata("design:type", Boolean)
], CreateCategoryDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "deviceId", void 0);
class UpdateCategoryDto extends (0, swagger_1.PartialType)(CreateCategoryDto) {
}
exports.UpdateCategoryDto = UpdateCategoryDto;
class MerchantDto extends SyncableFieldsDto {
    name;
    normalizedName;
}
exports.MerchantDto = MerchantDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MerchantDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], MerchantDto.prototype, "normalizedName", void 0);
class CreateMerchantDto {
    id;
    name;
    normalizedName;
    clientUpdatedAtMillis;
    deviceId;
}
exports.CreateMerchantDto = CreateMerchantDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateMerchantDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateMerchantDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateMerchantDto.prototype, "normalizedName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateMerchantDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateMerchantDto.prototype, "deviceId", void 0);
class UpdateMerchantDto extends (0, swagger_1.PartialType)(CreateMerchantDto) {
}
exports.UpdateMerchantDto = UpdateMerchantDto;
class TransactionDto extends SyncableFieldsDto {
    type;
    originalAmountMinor;
    originalCurrencyCode;
    primaryAmountMinor;
    primaryCurrencyCode;
    usdAmountMinor;
    usdCurrencyCode;
    exchangeRate;
    exchangeRateFromCurrencyCode;
    exchangeRateToCurrencyCode;
    exchangeRateSource;
    exchangeRateTimestampMillis;
    categoryId;
    walletId;
    paymentMethodId;
    paymentMethodKey;
    merchantId;
    title;
    note;
    occurredAtMillis;
    source;
    rawInput;
    confidence;
}
exports.TransactionDto = TransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TransactionDto.prototype, "originalAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "originalCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TransactionDto.prototype, "primaryAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "primaryCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], TransactionDto.prototype, "usdAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "usdCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "exchangeRateFromCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "exchangeRateToCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "exchangeRateSource", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], TransactionDto.prototype, "exchangeRateTimestampMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "paymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "paymentMethodKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TransactionDto.prototype, "occurredAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 'MANUAL' }),
    __metadata("design:type", String)
], TransactionDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "rawInput", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], TransactionDto.prototype, "confidence", void 0);
class CreateTransactionDto {
    id;
    type;
    originalAmountMinor;
    originalCurrencyCode;
    primaryAmountMinor;
    primaryCurrencyCode;
    usdAmountMinor;
    usdCurrencyCode;
    exchangeRate;
    exchangeRateFromCurrencyCode;
    exchangeRateToCurrencyCode;
    exchangeRateSource;
    exchangeRateTimestampMillis;
    categoryId;
    walletId;
    paymentMethodId;
    paymentMethodKey;
    merchantId;
    title;
    note;
    occurredAtMillis;
    source;
    rawInput;
    confidence;
    clientUpdatedAtMillis;
    deviceId;
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "originalAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "originalCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "primaryAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "primaryCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "usdAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "usdCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "exchangeRateFromCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "exchangeRateToCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "exchangeRateSource", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "exchangeRateTimestampMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentMethodKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "occurredAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'MANUAL' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "rawInput", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "confidence", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "deviceId", void 0);
class UpdateTransactionDto extends (0, swagger_1.PartialType)(CreateTransactionDto) {
}
exports.UpdateTransactionDto = UpdateTransactionDto;
class TransactionQueryDto {
    fromMillis;
    toMillis;
    categoryId;
}
exports.TransactionQueryDto = TransactionQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter transactions from this epoch millis' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TransactionQueryDto.prototype, "fromMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter transactions until this epoch millis' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TransactionQueryDto.prototype, "toMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionQueryDto.prototype, "categoryId", void 0);
class BudgetDto extends SyncableFieldsDto {
    name;
    categoryId;
    walletId;
    limitAmountMinor;
    currencyCode;
    periodType;
    periodStartUtcMillis;
    periodEndExclusiveUtcMillis;
    alertThresholdPercent;
    isActive;
}
exports.BudgetDto = BudgetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], BudgetDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], BudgetDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], BudgetDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BudgetDto.prototype, "limitAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BudgetDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BudgetDto.prototype, "periodType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BudgetDto.prototype, "periodStartUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], BudgetDto.prototype, "periodEndExclusiveUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 80 }),
    __metadata("design:type", Number)
], BudgetDto.prototype, "alertThresholdPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: true }),
    __metadata("design:type", Boolean)
], BudgetDto.prototype, "isActive", void 0);
class CreateBudgetDto {
    id;
    name;
    categoryId;
    walletId;
    limitAmountMinor;
    currencyCode;
    periodType;
    periodStartUtcMillis;
    periodEndExclusiveUtcMillis;
    alertThresholdPercent;
    isActive;
    clientUpdatedAtMillis;
    deviceId;
}
exports.CreateBudgetDto = CreateBudgetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "limitAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "periodType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "periodStartUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "periodEndExclusiveUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 80 }),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "alertThresholdPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    __metadata("design:type", Boolean)
], CreateBudgetDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "deviceId", void 0);
class UpdateBudgetDto extends (0, swagger_1.PartialType)(CreateBudgetDto) {
}
exports.UpdateBudgetDto = UpdateBudgetDto;
class RecurringExpenseDto extends SyncableFieldsDto {
    title;
    transactionType;
    amountMinor;
    currencyCode;
    categoryId;
    walletId;
    merchantId;
    frequency;
    dueDayOfMonth;
    recurrenceDays;
    nextDueAtMillis;
    paymentMethodKey;
    isActive;
}
exports.RecurringExpenseDto = RecurringExpenseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecurringExpenseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecurringExpenseDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RecurringExpenseDto.prototype, "amountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecurringExpenseDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], RecurringExpenseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], RecurringExpenseDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], RecurringExpenseDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecurringExpenseDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RecurringExpenseDto.prototype, "dueDayOfMonth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], RecurringExpenseDto.prototype, "recurrenceDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RecurringExpenseDto.prototype, "nextDueAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], RecurringExpenseDto.prototype, "paymentMethodKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: true }),
    __metadata("design:type", Boolean)
], RecurringExpenseDto.prototype, "isActive", void 0);
class CreateRecurringExpenseDto {
    id;
    title;
    transactionType;
    amountMinor;
    currencyCode;
    categoryId;
    walletId;
    merchantId;
    frequency;
    dueDayOfMonth;
    recurrenceDays;
    nextDueAtMillis;
    paymentMethodKey;
    isActive;
    clientUpdatedAtMillis;
    deviceId;
}
exports.CreateRecurringExpenseDto = CreateRecurringExpenseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateRecurringExpenseDto.prototype, "amountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateRecurringExpenseDto.prototype, "dueDayOfMonth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "recurrenceDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateRecurringExpenseDto.prototype, "nextDueAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "paymentMethodKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    __metadata("design:type", Boolean)
], CreateRecurringExpenseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateRecurringExpenseDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateRecurringExpenseDto.prototype, "deviceId", void 0);
class UpdateRecurringExpenseDto extends (0, swagger_1.PartialType)(CreateRecurringExpenseDto) {
}
exports.UpdateRecurringExpenseDto = UpdateRecurringExpenseDto;
class SavingsPlanDto extends SyncableFieldsDto {
    name;
    purpose;
    goalAmountMinor;
    currencyCode;
    plannedContributionAmountMinor;
    frequency;
    walletId;
    startDateUtcMillis;
    targetDateUtcMillis;
    iconName;
    colorHex;
    notes;
    isActive;
}
exports.SavingsPlanDto = SavingsPlanDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SavingsPlanDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SavingsPlanDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SavingsPlanDto.prototype, "goalAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SavingsPlanDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SavingsPlanDto.prototype, "plannedContributionAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SavingsPlanDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SavingsPlanDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SavingsPlanDto.prototype, "startDateUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], SavingsPlanDto.prototype, "targetDateUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SavingsPlanDto.prototype, "iconName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SavingsPlanDto.prototype, "colorHex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SavingsPlanDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: true }),
    __metadata("design:type", Boolean)
], SavingsPlanDto.prototype, "isActive", void 0);
class CreateSavingsPlanDto {
    id;
    name;
    purpose;
    goalAmountMinor;
    currencyCode;
    plannedContributionAmountMinor;
    frequency;
    walletId;
    startDateUtcMillis;
    targetDateUtcMillis;
    iconName;
    colorHex;
    notes;
    isActive;
    clientUpdatedAtMillis;
    deviceId;
}
exports.CreateSavingsPlanDto = CreateSavingsPlanDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsPlanDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateSavingsPlanDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsPlanDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateSavingsPlanDto.prototype, "goalAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateSavingsPlanDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateSavingsPlanDto.prototype, "plannedContributionAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateSavingsPlanDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsPlanDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateSavingsPlanDto.prototype, "startDateUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateSavingsPlanDto.prototype, "targetDateUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsPlanDto.prototype, "iconName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsPlanDto.prototype, "colorHex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsPlanDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    __metadata("design:type", Boolean)
], CreateSavingsPlanDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateSavingsPlanDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsPlanDto.prototype, "deviceId", void 0);
class UpdateSavingsPlanDto extends (0, swagger_1.PartialType)(CreateSavingsPlanDto) {
}
exports.UpdateSavingsPlanDto = UpdateSavingsPlanDto;
class SavingsMovementDto extends SyncableFieldsDto {
    savingsPlanId;
    type;
    originalAmountMinor;
    originalCurrencyCode;
    convertedAmountMinor;
    convertedCurrencyCode;
    exchangeRate;
    exchangeRateSource;
    exchangeRateTimestampMillis;
    walletId;
    dateUtcMillis;
    reason;
    note;
}
exports.SavingsMovementDto = SavingsMovementDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SavingsMovementDto.prototype, "savingsPlanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SavingsMovementDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SavingsMovementDto.prototype, "originalAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SavingsMovementDto.prototype, "originalCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SavingsMovementDto.prototype, "convertedAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SavingsMovementDto.prototype, "convertedCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SavingsMovementDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SavingsMovementDto.prototype, "exchangeRateSource", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], SavingsMovementDto.prototype, "exchangeRateTimestampMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SavingsMovementDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SavingsMovementDto.prototype, "dateUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SavingsMovementDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SavingsMovementDto.prototype, "note", void 0);
class CreateSavingsMovementDto {
    id;
    savingsPlanId;
    type;
    originalAmountMinor;
    originalCurrencyCode;
    convertedAmountMinor;
    convertedCurrencyCode;
    exchangeRate;
    exchangeRateSource;
    exchangeRateTimestampMillis;
    walletId;
    dateUtcMillis;
    reason;
    note;
    clientUpdatedAtMillis;
    deviceId;
}
exports.CreateSavingsMovementDto = CreateSavingsMovementDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "savingsPlanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateSavingsMovementDto.prototype, "originalAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "originalCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateSavingsMovementDto.prototype, "convertedAmountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "convertedCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "exchangeRateSource", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateSavingsMovementDto.prototype, "exchangeRateTimestampMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateSavingsMovementDto.prototype, "dateUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateSavingsMovementDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateSavingsMovementDto.prototype, "deviceId", void 0);
class UpdateSavingsMovementDto extends (0, swagger_1.PartialType)(CreateSavingsMovementDto) {
}
exports.UpdateSavingsMovementDto = UpdateSavingsMovementDto;
class InvestmentDto extends SyncableFieldsDto {
    name;
    institution;
    type;
    currencyCode;
    defaultWalletId;
    notes;
    isActive;
}
exports.InvestmentDto = InvestmentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvestmentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvestmentDto.prototype, "institution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvestmentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvestmentDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], InvestmentDto.prototype, "defaultWalletId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], InvestmentDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: true }),
    __metadata("design:type", Boolean)
], InvestmentDto.prototype, "isActive", void 0);
class CreateInvestmentDto {
    id;
    name;
    institution;
    type;
    currencyCode;
    defaultWalletId;
    notes;
    isActive;
    clientUpdatedAtMillis;
    deviceId;
}
exports.CreateInvestmentDto = CreateInvestmentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "institution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "defaultWalletId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    __metadata("design:type", Boolean)
], CreateInvestmentDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateInvestmentDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "deviceId", void 0);
class UpdateInvestmentDto extends (0, swagger_1.PartialType)(CreateInvestmentDto) {
}
exports.UpdateInvestmentDto = UpdateInvestmentDto;
class InvestmentMovementDto extends SyncableFieldsDto {
    investmentId;
    type;
    amountMinor;
    currencyCode;
    walletId;
    dateUtcMillis;
    note;
}
exports.InvestmentMovementDto = InvestmentMovementDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvestmentMovementDto.prototype, "investmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvestmentMovementDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InvestmentMovementDto.prototype, "amountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvestmentMovementDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], InvestmentMovementDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InvestmentMovementDto.prototype, "dateUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], InvestmentMovementDto.prototype, "note", void 0);
class CreateInvestmentMovementDto {
    id;
    investmentId;
    type;
    amountMinor;
    currencyCode;
    walletId;
    dateUtcMillis;
    note;
    clientUpdatedAtMillis;
    deviceId;
}
exports.CreateInvestmentMovementDto = CreateInvestmentMovementDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateInvestmentMovementDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateInvestmentMovementDto.prototype, "investmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateInvestmentMovementDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateInvestmentMovementDto.prototype, "amountMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateInvestmentMovementDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateInvestmentMovementDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateInvestmentMovementDto.prototype, "dateUtcMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateInvestmentMovementDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], CreateInvestmentMovementDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CreateInvestmentMovementDto.prototype, "deviceId", void 0);
class UpdateInvestmentMovementDto extends (0, swagger_1.PartialType)(CreateInvestmentMovementDto) {
}
exports.UpdateInvestmentMovementDto = UpdateInvestmentMovementDto;
class UserSettingsDto extends SyncableFieldsDto {
    primaryCurrencyCode;
    hasCompletedOnboarding;
    themeMode;
    defaultWalletId;
    voiceInputEnabled;
    usdConversionEnabled;
    preferredSecondaryCurrencyCode;
    exchangeRateMode;
    manualUsdPerPrimaryUnit;
    microExpenseThresholdPrimaryMinor;
    appLanguage;
    textSize;
    googleUserName;
    googleUserEmail;
    googleUserProfilePictureUrl;
    displayNameUserEdited;
}
exports.UserSettingsDto = UserSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ default: 'USD' }),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "primaryCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], UserSettingsDto.prototype, "hasCompletedOnboarding", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 'SYSTEM' }),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "themeMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "defaultWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: true }),
    __metadata("design:type", Boolean)
], UserSettingsDto.prototype, "voiceInputEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], UserSettingsDto.prototype, "usdConversionEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "preferredSecondaryCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 'AUTO' }),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "exchangeRateMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "manualUsdPerPrimaryUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 0 }),
    __metadata("design:type", Number)
], UserSettingsDto.prototype, "microExpenseThresholdPrimaryMinor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "appLanguage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 'MEDIUM' }),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "textSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "googleUserName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "googleUserEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "googleUserProfilePictureUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], UserSettingsDto.prototype, "displayNameUserEdited", void 0);
class UpdateUserSettingsDto {
    primaryCurrencyCode;
    hasCompletedOnboarding;
    themeMode;
    defaultWalletId;
    voiceInputEnabled;
    usdConversionEnabled;
    preferredSecondaryCurrencyCode;
    exchangeRateMode;
    manualUsdPerPrimaryUnit;
    microExpenseThresholdPrimaryMinor;
    appLanguage;
    textSize;
    googleUserName;
    googleUserEmail;
    googleUserProfilePictureUrl;
    displayNameUserEdited;
    clientUpdatedAtMillis;
    deviceId;
}
exports.UpdateUserSettingsDto = UpdateUserSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "primaryCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Boolean)
], UpdateUserSettingsDto.prototype, "hasCompletedOnboarding", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "themeMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "defaultWalletId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Boolean)
], UpdateUserSettingsDto.prototype, "voiceInputEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Boolean)
], UpdateUserSettingsDto.prototype, "usdConversionEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "preferredSecondaryCurrencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "exchangeRateMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "manualUsdPerPrimaryUnit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UpdateUserSettingsDto.prototype, "microExpenseThresholdPrimaryMinor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "appLanguage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "textSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "googleUserName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "googleUserEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "googleUserProfilePictureUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Boolean)
], UpdateUserSettingsDto.prototype, "displayNameUserEdited", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UpdateUserSettingsDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "deviceId", void 0);
class CurrencyDto {
    code;
    minorUnits;
    displayLabel;
    createdAtMillis;
    updatedAtMillis;
}
exports.CurrencyDto = CurrencyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CurrencyDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CurrencyDto.prototype, "minorUnits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CurrencyDto.prototype, "displayLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CurrencyDto.prototype, "createdAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CurrencyDto.prototype, "updatedAtMillis", void 0);
class CurrencySeedResponseDto {
    seeded;
}
exports.CurrencySeedResponseDto = CurrencySeedResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], CurrencySeedResponseDto.prototype, "seeded", void 0);
