import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Budget,
  BudgetDocument,
  BudgetMemberQuota,
  BudgetMemberQuotaDocument,
  Category,
  CategoryDocument,
  DebtAccount,
  DebtAccountDocument,
  ExpenseSplit,
  ExpenseSplitDocument,
  ExpenseSplitLine,
  ExpenseSplitLineDocument,
  Investment,
  InvestmentDocument,
  InvestmentMovement,
  InvestmentMovementDocument,
  Merchant,
  MerchantDocument,
  RecurringExpense,
  RecurringExpenseDocument,
  Settlement,
  SettlementDocument,
  SavingsMovement,
  SavingsMovementDocument,
  SavingsPlan,
  SavingsPlanDocument,
  Transaction,
  TransactionDocument,
  UserSettings,
  UserSettingsDocument,
  Wallet,
  WalletDocument,
} from '../../../shared/database/entity.schemas';
import {
  SyncMetadata,
  SyncMetadataDocument,
} from '../../../shared/sync/sync-metadata.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
  User,
  UserDocument,
} from '../infrastructure/user.schema';

type EntityModel = Model<Record<string, unknown>>;

@Injectable()
export class AccountDeletionService {
  private readonly logger = new Logger(AccountDeletionService.name);
  private readonly syncEntityModels: EntityModel[];

  constructor(
    @InjectModel(UserSettings.name)
    settingsModel: Model<UserSettingsDocument>,
    @InjectModel(Wallet.name) walletModel: Model<WalletDocument>,
    @InjectModel(Category.name) categoryModel: Model<CategoryDocument>,
    @InjectModel(Merchant.name) merchantModel: Model<MerchantDocument>,
    @InjectModel(Transaction.name) transactionModel: Model<TransactionDocument>,
    @InjectModel(Budget.name) budgetModel: Model<BudgetDocument>,
    @InjectModel(BudgetMemberQuota.name)
    budgetMemberQuotaModel: Model<BudgetMemberQuotaDocument>,
    @InjectModel(DebtAccount.name)
    debtAccountModel: Model<DebtAccountDocument>,
    @InjectModel(ExpenseSplit.name)
    expenseSplitModel: Model<ExpenseSplitDocument>,
    @InjectModel(ExpenseSplitLine.name)
    expenseSplitLineModel: Model<ExpenseSplitLineDocument>,
    @InjectModel(RecurringExpense.name)
    recurringModel: Model<RecurringExpenseDocument>,
    @InjectModel(Settlement.name)
    settlementModel: Model<SettlementDocument>,
    @InjectModel(SavingsPlan.name) savingsPlanModel: Model<SavingsPlanDocument>,
    @InjectModel(SavingsMovement.name)
    savingsMovementModel: Model<SavingsMovementDocument>,
    @InjectModel(Investment.name) investmentModel: Model<InvestmentDocument>,
    @InjectModel(InvestmentMovement.name)
    investmentMovementModel: Model<InvestmentMovementDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(SyncMetadata.name)
    private readonly syncMetadataModel: Model<SyncMetadataDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    this.syncEntityModels = [
      settingsModel as unknown as EntityModel,
      walletModel as unknown as EntityModel,
      categoryModel as unknown as EntityModel,
      merchantModel as unknown as EntityModel,
      transactionModel as unknown as EntityModel,
      budgetModel as unknown as EntityModel,
      budgetMemberQuotaModel as unknown as EntityModel,
      debtAccountModel as unknown as EntityModel,
      expenseSplitModel as unknown as EntityModel,
      expenseSplitLineModel as unknown as EntityModel,
      recurringModel as unknown as EntityModel,
      settlementModel as unknown as EntityModel,
      savingsPlanModel as unknown as EntityModel,
      savingsMovementModel as unknown as EntityModel,
      investmentModel as unknown as EntityModel,
      investmentMovementModel as unknown as EntityModel,
    ];
  }

  async deleteUserAccount(userId: string): Promise<{ success: true }> {
    for (const model of this.syncEntityModels) {
      await model.deleteMany({ userId });
    }

    await this.refreshTokenModel.deleteMany({ userId });
    await this.syncMetadataModel.deleteMany({ userId });
    await this.userModel.findByIdAndDelete(userId);

    this.logger.log(`Deleted account and all data for user ${userId}`);
    return { success: true };
  }
}
