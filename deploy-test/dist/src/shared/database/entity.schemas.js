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
exports.ExchangeRateSnapshotSchema = exports.ExchangeRateSnapshot = exports.CurrencySchema = exports.Currency = exports.InvestmentMovementSchema = exports.InvestmentMovement = exports.InvestmentSchema = exports.Investment = exports.SavingsMovementSchema = exports.SavingsMovement = exports.SavingsPlanSchema = exports.SavingsPlan = exports.RecurringExpenseSchema = exports.RecurringExpense = exports.BudgetSchema = exports.Budget = exports.TransactionSchema = exports.Transaction = exports.MerchantSchema = exports.Merchant = exports.CategorySchema = exports.Category = exports.WalletSchema = exports.Wallet = exports.UserSettingsSchema = exports.UserSettings = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const syncable_schema_1 = require("../../shared/sync/syncable.schema");
let UserSettings = class UserSettings extends syncable_schema_1.SyncableEntity {
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
};
exports.UserSettings = UserSettings;
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'USD' }),
    __metadata("design:type", String)
], UserSettings.prototype, "primaryCurrencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], UserSettings.prototype, "hasCompletedOnboarding", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'SYSTEM' }),
    __metadata("design:type", String)
], UserSettings.prototype, "themeMode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserSettings.prototype, "defaultWalletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], UserSettings.prototype, "voiceInputEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], UserSettings.prototype, "usdConversionEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserSettings.prototype, "preferredSecondaryCurrencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'AUTO' }),
    __metadata("design:type", String)
], UserSettings.prototype, "exchangeRateMode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserSettings.prototype, "manualUsdPerPrimaryUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], UserSettings.prototype, "microExpenseThresholdPrimaryMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserSettings.prototype, "appLanguage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'MEDIUM' }),
    __metadata("design:type", String)
], UserSettings.prototype, "textSize", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserSettings.prototype, "googleUserName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserSettings.prototype, "googleUserEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserSettings.prototype, "googleUserProfilePictureUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], UserSettings.prototype, "displayNameUserEdited", void 0);
exports.UserSettings = UserSettings = __decorate([
    (0, mongoose_1.Schema)({ collection: 'user_settings', strict: true })
], UserSettings);
exports.UserSettingsSchema = mongoose_1.SchemaFactory.createForClass(UserSettings);
(0, syncable_schema_1.syncableIndexes)(exports.UserSettingsSchema);
exports.UserSettingsSchema.index({ userId: 1 }, { unique: true });
let Wallet = class Wallet extends syncable_schema_1.SyncableEntity {
    name;
    currencyCode;
    walletType;
    initialBalanceMinor;
    isDefault;
};
exports.Wallet = Wallet;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Wallet.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Wallet.prototype, "currencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'CASH' }),
    __metadata("design:type", String)
], Wallet.prototype, "walletType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Wallet.prototype, "initialBalanceMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], Wallet.prototype, "isDefault", void 0);
exports.Wallet = Wallet = __decorate([
    (0, mongoose_1.Schema)({ collection: 'wallets' })
], Wallet);
exports.WalletSchema = mongoose_1.SchemaFactory.createForClass(Wallet);
(0, syncable_schema_1.syncableIndexes)(exports.WalletSchema);
(0, syncable_schema_1.householdShareableIndexes)(exports.WalletSchema);
let Category = class Category extends syncable_schema_1.SyncableEntity {
    key;
    customName;
    type;
    iconName;
    colorHex;
    isDefault;
};
exports.Category = Category;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Category.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Category.prototype, "customName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Category.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Category.prototype, "iconName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Category.prototype, "colorHex", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], Category.prototype, "isDefault", void 0);
exports.Category = Category = __decorate([
    (0, mongoose_1.Schema)({ collection: 'categories' })
], Category);
exports.CategorySchema = mongoose_1.SchemaFactory.createForClass(Category);
(0, syncable_schema_1.syncableIndexes)(exports.CategorySchema);
(0, syncable_schema_1.householdShareableIndexes)(exports.CategorySchema);
let Merchant = class Merchant extends syncable_schema_1.SyncableEntity {
    name;
    normalizedName;
};
exports.Merchant = Merchant;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Merchant.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Merchant.prototype, "normalizedName", void 0);
exports.Merchant = Merchant = __decorate([
    (0, mongoose_1.Schema)({ collection: 'merchants' })
], Merchant);
exports.MerchantSchema = mongoose_1.SchemaFactory.createForClass(Merchant);
(0, syncable_schema_1.syncableIndexes)(exports.MerchantSchema);
let Transaction = class Transaction extends syncable_schema_1.SyncableEntity {
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
};
exports.Transaction = Transaction;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "originalAmountMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "originalCurrencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "primaryAmountMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "primaryCurrencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Transaction.prototype, "usdAmountMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "usdCurrencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "exchangeRate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "exchangeRateFromCurrencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "exchangeRateToCurrencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "exchangeRateSource", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Transaction.prototype, "exchangeRateTimestampMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "categoryId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "walletId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "paymentMethodId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "paymentMethodKey", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "merchantId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "note", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "occurredAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'MANUAL' }),
    __metadata("design:type", String)
], Transaction.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transaction.prototype, "rawInput", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Transaction.prototype, "confidence", void 0);
exports.Transaction = Transaction = __decorate([
    (0, mongoose_1.Schema)({ collection: 'transactions' })
], Transaction);
exports.TransactionSchema = mongoose_1.SchemaFactory.createForClass(Transaction);
(0, syncable_schema_1.syncableIndexes)(exports.TransactionSchema);
(0, syncable_schema_1.householdShareableIndexes)(exports.TransactionSchema);
exports.TransactionSchema.index({ userId: 1, occurredAtMillis: -1 });
let Budget = class Budget extends syncable_schema_1.SyncableEntity {
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
};
exports.Budget = Budget;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Budget.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Budget.prototype, "categoryId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Budget.prototype, "walletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Budget.prototype, "limitAmountMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Budget.prototype, "currencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Budget.prototype, "periodType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Budget.prototype, "periodStartUtcMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Budget.prototype, "periodEndExclusiveUtcMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 80 }),
    __metadata("design:type", Number)
], Budget.prototype, "alertThresholdPercent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], Budget.prototype, "isActive", void 0);
exports.Budget = Budget = __decorate([
    (0, mongoose_1.Schema)({ collection: 'budgets' })
], Budget);
exports.BudgetSchema = mongoose_1.SchemaFactory.createForClass(Budget);
(0, syncable_schema_1.syncableIndexes)(exports.BudgetSchema);
(0, syncable_schema_1.householdShareableIndexes)(exports.BudgetSchema);
let RecurringExpense = class RecurringExpense extends syncable_schema_1.SyncableEntity {
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
};
exports.RecurringExpense = RecurringExpense;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], RecurringExpense.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], RecurringExpense.prototype, "transactionType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], RecurringExpense.prototype, "amountMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], RecurringExpense.prototype, "currencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RecurringExpense.prototype, "categoryId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RecurringExpense.prototype, "walletId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RecurringExpense.prototype, "merchantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], RecurringExpense.prototype, "frequency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], RecurringExpense.prototype, "dueDayOfMonth", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RecurringExpense.prototype, "recurrenceDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], RecurringExpense.prototype, "nextDueAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RecurringExpense.prototype, "paymentMethodKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], RecurringExpense.prototype, "isActive", void 0);
exports.RecurringExpense = RecurringExpense = __decorate([
    (0, mongoose_1.Schema)({ collection: 'recurring_expenses' })
], RecurringExpense);
exports.RecurringExpenseSchema = mongoose_1.SchemaFactory.createForClass(RecurringExpense);
(0, syncable_schema_1.syncableIndexes)(exports.RecurringExpenseSchema);
let SavingsPlan = class SavingsPlan extends syncable_schema_1.SyncableEntity {
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
};
exports.SavingsPlan = SavingsPlan;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SavingsPlan.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SavingsPlan.prototype, "purpose", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SavingsPlan.prototype, "goalAmountMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SavingsPlan.prototype, "currencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SavingsPlan.prototype, "plannedContributionAmountMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SavingsPlan.prototype, "frequency", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SavingsPlan.prototype, "walletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SavingsPlan.prototype, "startDateUtcMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], SavingsPlan.prototype, "targetDateUtcMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SavingsPlan.prototype, "iconName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SavingsPlan.prototype, "colorHex", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SavingsPlan.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], SavingsPlan.prototype, "isActive", void 0);
exports.SavingsPlan = SavingsPlan = __decorate([
    (0, mongoose_1.Schema)({ collection: 'savings_plans' })
], SavingsPlan);
exports.SavingsPlanSchema = mongoose_1.SchemaFactory.createForClass(SavingsPlan);
(0, syncable_schema_1.syncableIndexes)(exports.SavingsPlanSchema);
(0, syncable_schema_1.householdShareableIndexes)(exports.SavingsPlanSchema);
let SavingsMovement = class SavingsMovement extends syncable_schema_1.SyncableEntity {
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
};
exports.SavingsMovement = SavingsMovement;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SavingsMovement.prototype, "savingsPlanId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SavingsMovement.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SavingsMovement.prototype, "originalAmountMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SavingsMovement.prototype, "originalCurrencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SavingsMovement.prototype, "convertedAmountMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SavingsMovement.prototype, "convertedCurrencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SavingsMovement.prototype, "exchangeRate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SavingsMovement.prototype, "exchangeRateSource", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], SavingsMovement.prototype, "exchangeRateTimestampMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SavingsMovement.prototype, "walletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SavingsMovement.prototype, "dateUtcMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SavingsMovement.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SavingsMovement.prototype, "note", void 0);
exports.SavingsMovement = SavingsMovement = __decorate([
    (0, mongoose_1.Schema)({ collection: 'savings_movements' })
], SavingsMovement);
exports.SavingsMovementSchema = mongoose_1.SchemaFactory.createForClass(SavingsMovement);
(0, syncable_schema_1.syncableIndexes)(exports.SavingsMovementSchema);
(0, syncable_schema_1.householdShareableIndexes)(exports.SavingsMovementSchema);
let Investment = class Investment extends syncable_schema_1.SyncableEntity {
    name;
    institution;
    type;
    currencyCode;
    defaultWalletId;
    notes;
    isActive;
};
exports.Investment = Investment;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Investment.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Investment.prototype, "institution", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Investment.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Investment.prototype, "currencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Investment.prototype, "defaultWalletId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Investment.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], Investment.prototype, "isActive", void 0);
exports.Investment = Investment = __decorate([
    (0, mongoose_1.Schema)({ collection: 'investments' })
], Investment);
exports.InvestmentSchema = mongoose_1.SchemaFactory.createForClass(Investment);
(0, syncable_schema_1.syncableIndexes)(exports.InvestmentSchema);
(0, syncable_schema_1.householdShareableIndexes)(exports.InvestmentSchema);
let InvestmentMovement = class InvestmentMovement extends syncable_schema_1.SyncableEntity {
    investmentId;
    type;
    amountMinor;
    currencyCode;
    walletId;
    dateUtcMillis;
    note;
};
exports.InvestmentMovement = InvestmentMovement;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InvestmentMovement.prototype, "investmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InvestmentMovement.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], InvestmentMovement.prototype, "amountMinor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InvestmentMovement.prototype, "currencyCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], InvestmentMovement.prototype, "walletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], InvestmentMovement.prototype, "dateUtcMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], InvestmentMovement.prototype, "note", void 0);
exports.InvestmentMovement = InvestmentMovement = __decorate([
    (0, mongoose_1.Schema)({ collection: 'investment_movements' })
], InvestmentMovement);
exports.InvestmentMovementSchema = mongoose_1.SchemaFactory.createForClass(InvestmentMovement);
(0, syncable_schema_1.syncableIndexes)(exports.InvestmentMovementSchema);
(0, syncable_schema_1.householdShareableIndexes)(exports.InvestmentMovementSchema);
let Currency = class Currency {
    code;
    minorUnits;
    displayLabel;
    createdAtMillis;
    updatedAtMillis;
};
exports.Currency = Currency;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Currency.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Currency.prototype, "minorUnits", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Currency.prototype, "displayLabel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Currency.prototype, "createdAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Currency.prototype, "updatedAtMillis", void 0);
exports.Currency = Currency = __decorate([
    (0, mongoose_1.Schema)({ collection: 'currencies', strict: true })
], Currency);
exports.CurrencySchema = mongoose_1.SchemaFactory.createForClass(Currency);
let ExchangeRateSnapshot = class ExchangeRateSnapshot {
    baseCurrency;
    snapshotDate;
    rates;
    fetchedAtMillis;
    expiresAtMillis;
};
exports.ExchangeRateSnapshot = ExchangeRateSnapshot;
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'USD' }),
    __metadata("design:type", String)
], ExchangeRateSnapshot.prototype, "baseCurrency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ExchangeRateSnapshot.prototype, "snapshotDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], ExchangeRateSnapshot.prototype, "rates", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ExchangeRateSnapshot.prototype, "fetchedAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ExchangeRateSnapshot.prototype, "expiresAtMillis", void 0);
exports.ExchangeRateSnapshot = ExchangeRateSnapshot = __decorate([
    (0, mongoose_1.Schema)({ collection: 'exchange_rate_snapshots', strict: true })
], ExchangeRateSnapshot);
exports.ExchangeRateSnapshotSchema = mongoose_1.SchemaFactory.createForClass(ExchangeRateSnapshot);
exports.ExchangeRateSnapshotSchema.index({ baseCurrency: 1, snapshotDate: 1 }, { unique: true });
