import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSharedModule } from '../../shared/auth/auth-shared.module';
import {
  SyncMetadata,
  SyncMetadataSchema,
} from '../../shared/sync/sync-metadata.schema';
import {
  Budget,
  BudgetSchema,
  BudgetMemberQuota,
  BudgetMemberQuotaSchema,
  Category,
  CategorySchema,
  PersonalLoan, PersonalLoanSchema, PersonalLoanRepayment, PersonalLoanRepaymentSchema,
  DebtAccount,
  DebtAccountSchema,
  ExpenseSplit,
  ExpenseSplitSchema,
  ExpenseSplitLine,
  ExpenseSplitLineSchema,
  Investment,
  InvestmentSchema,
  InvestmentMovement,
  InvestmentMovementSchema,
  Merchant,
  MerchantSchema,
  RecurringExpense,
  RecurringExpenseSchema,
  Settlement,
  SettlementSchema,
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
import {
  UserEntitlement,
  UserEntitlementSchema,
} from '../households/infrastructure/household.schemas';
import {
  RefreshToken,
  RefreshTokenSchema,
  User,
  UserSchema,
} from './infrastructure/user.schema';
import { AccountDeletionService } from './application/account-deletion.service';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { SettingsModule } from '../settings/settings.module';
import { AppleTokenVerifier } from '../../shared/auth/apple-token.verifier';

@Module({
  imports: [
    AuthSharedModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: SyncMetadata.name, schema: SyncMetadataSchema },
      { name: UserSettings.name, schema: UserSettingsSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Budget.name, schema: BudgetSchema },
      { name: BudgetMemberQuota.name, schema: BudgetMemberQuotaSchema },
      { name: DebtAccount.name, schema: DebtAccountSchema },
      { name: PersonalLoan.name, schema: PersonalLoanSchema },
      { name: PersonalLoanRepayment.name, schema: PersonalLoanRepaymentSchema },
      { name: ExpenseSplit.name, schema: ExpenseSplitSchema },
      { name: ExpenseSplitLine.name, schema: ExpenseSplitLineSchema },
      { name: RecurringExpense.name, schema: RecurringExpenseSchema },
      { name: Settlement.name, schema: SettlementSchema },
      { name: SavingsPlan.name, schema: SavingsPlanSchema },
      { name: SavingsMovement.name, schema: SavingsMovementSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: InvestmentMovement.name, schema: InvestmentMovementSchema },
      { name: UserEntitlement.name, schema: UserEntitlementSchema },
    ]),
    forwardRef(() => SettingsModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccountDeletionService, AppleTokenVerifier],
  exports: [AuthService],
})
export class AuthModule {}
