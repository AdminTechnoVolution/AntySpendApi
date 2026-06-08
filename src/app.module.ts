import { Module } from '@nestjs/common';
import { AppConfigModule } from './shared/config/config.module';
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SettingsModule } from './modules/settings/settings.module';
import { WalletModule } from './modules/wallets/wallets.module';
import { CategoryModule } from './modules/categories/categories.module';
import { MerchantModule } from './modules/merchants/merchants.module';
import { TransactionModule } from './modules/transactions/transactions.module';
import { BudgetModule } from './modules/budgets/budgets.module';
import { RecurringExpenseModule } from './modules/recurring-expenses/recurring-expenses.module';
import { SavingsPlanModule } from './modules/savings-plans/savings-plans.module';
import { SavingsMovementModule } from './modules/savings-movements/savings-movements.module';
import { InvestmentModule } from './modules/investments/investments.module';
import { InvestmentMovementModule } from './modules/investment-movements/investment-movements.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { AiModule } from './modules/ai/ai.module';
import { SyncModule } from './modules/sync/sync.module';
import { HouseholdsModule } from './modules/households/households.module';
import { BillingNotificationsModule } from './modules/billing-notifications/billing-notifications.module';
import { AppThrottlingModule } from './shared/throttling/throttling.module';

@Module({
  imports: [
    AppConfigModule,
    AppThrottlingModule,
    DatabaseModule,
    AuthModule,
    SettingsModule,
    WalletModule,
    CategoryModule,
    MerchantModule,
    TransactionModule,
    BudgetModule,
    RecurringExpenseModule,
    SavingsPlanModule,
    SavingsMovementModule,
    InvestmentModule,
    InvestmentMovementModule,
    CurrenciesModule,
    ExchangeRatesModule,
    AiModule,
    SyncModule,
    HouseholdsModule,
    BillingNotificationsModule,
  ],
})
export class AppModule {}
