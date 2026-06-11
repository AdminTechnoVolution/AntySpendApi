import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LwwService } from '../../shared/sync/lww.service';
import {
  SyncMetadata,
  SyncMetadataSchema,
} from '../../shared/sync/sync-metadata.schema';
import {
  Budget,
  BudgetSchema,
  Category,
  CategorySchema,
  Investment,
  InvestmentSchema,
  InvestmentMovement,
  InvestmentMovementSchema,
  ExpenseSplit,
  ExpenseSplitSchema,
  ExpenseSplitLine,
  ExpenseSplitLineSchema,
  Settlement,
  SettlementSchema,
  BudgetMemberQuota,
  BudgetMemberQuotaSchema,
  DebtAccount,
  DebtAccountSchema,
  Merchant,
  MerchantSchema,
  RecurringExpense,
  RecurringExpenseSchema,
  SavingsMovement,
  SavingsMovementSchema,
  SavingsPlan,
  SavingsPlanSchema,
  Transaction,
  TransactionSchema,
  UserSettings,
  UserSettingsSchema,
  Wallet,
  WalletSchema,
} from '../../shared/database/entity.schemas';
import { HouseholdsModule } from '../households/households.module';
import { SyncService } from './application/sync.service';
import { SyncController } from './presentation/sync.controller';

@Module({
  imports: [
    HouseholdsModule,
    MongooseModule.forFeature([
      { name: SyncMetadata.name, schema: SyncMetadataSchema },
      { name: UserSettings.name, schema: UserSettingsSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Budget.name, schema: BudgetSchema },
      { name: RecurringExpense.name, schema: RecurringExpenseSchema },
      { name: SavingsPlan.name, schema: SavingsPlanSchema },
      { name: SavingsMovement.name, schema: SavingsMovementSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: InvestmentMovement.name, schema: InvestmentMovementSchema },
      { name: ExpenseSplit.name, schema: ExpenseSplitSchema },
      { name: ExpenseSplitLine.name, schema: ExpenseSplitLineSchema },
      { name: Settlement.name, schema: SettlementSchema },
      { name: BudgetMemberQuota.name, schema: BudgetMemberQuotaSchema },
      { name: DebtAccount.name, schema: DebtAccountSchema },
    ]),
  ],
  controllers: [SyncController],
  providers: [SyncService, LwwService],
})
export class SyncModule {}
