"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("./shared/config/config.module");
const database_module_1 = require("./shared/database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const settings_module_1 = require("./modules/settings/settings.module");
const wallets_module_1 = require("./modules/wallets/wallets.module");
const categories_module_1 = require("./modules/categories/categories.module");
const merchants_module_1 = require("./modules/merchants/merchants.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const budgets_module_1 = require("./modules/budgets/budgets.module");
const recurring_expenses_module_1 = require("./modules/recurring-expenses/recurring-expenses.module");
const savings_plans_module_1 = require("./modules/savings-plans/savings-plans.module");
const savings_movements_module_1 = require("./modules/savings-movements/savings-movements.module");
const investments_module_1 = require("./modules/investments/investments.module");
const investment_movements_module_1 = require("./modules/investment-movements/investment-movements.module");
const currencies_module_1 = require("./modules/currencies/currencies.module");
const exchange_rates_module_1 = require("./modules/exchange-rates/exchange-rates.module");
const ai_module_1 = require("./modules/ai/ai.module");
const sync_module_1 = require("./modules/sync/sync.module");
const throttling_module_1 = require("./shared/throttling/throttling.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.AppConfigModule,
            throttling_module_1.AppThrottlingModule,
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            settings_module_1.SettingsModule,
            wallets_module_1.WalletModule,
            categories_module_1.CategoryModule,
            merchants_module_1.MerchantModule,
            transactions_module_1.TransactionModule,
            budgets_module_1.BudgetModule,
            recurring_expenses_module_1.RecurringExpenseModule,
            savings_plans_module_1.SavingsPlanModule,
            savings_movements_module_1.SavingsMovementModule,
            investments_module_1.InvestmentModule,
            investment_movements_module_1.InvestmentMovementModule,
            currencies_module_1.CurrenciesModule,
            exchange_rates_module_1.ExchangeRatesModule,
            ai_module_1.AiModule,
            sync_module_1.SyncModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map