import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenRouterModule } from '../../shared/openrouter/openrouter.module';
import { HouseholdsModule } from '../households/households.module';
import {
  Category,
  CategorySchema,
  Currency,
  CurrencySchema,
  RecurringExpense,
  RecurringExpenseSchema,
  Transaction,
  TransactionSchema,
  UserSettings,
  UserSettingsSchema,
} from '../../shared/database/entity.schemas';
import { AiService } from './application/ai.service';
import { AiController } from './presentation/ai.controller';
import { AiUsageQuotaGuard } from '../../shared/auth/ai-usage-quota.guard';
import { AiUsageQuotaInterceptor } from '../../shared/auth/ai-usage-quota.interceptor';

@Module({
  imports: [
    OpenRouterModule,
    HouseholdsModule,
    MongooseModule.forFeature([
      { name: Currency.name, schema: CurrencySchema },
      { name: Category.name, schema: CategorySchema },
      { name: UserSettings.name, schema: UserSettingsSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: RecurringExpense.name, schema: RecurringExpenseSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, AiUsageQuotaGuard, AiUsageQuotaInterceptor],
})
export class AiModule {}
