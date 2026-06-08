import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Budget,
  BudgetDocument,
  Category,
  CategoryDocument,
  Investment,
  InvestmentDocument,
  InvestmentMovement,
  InvestmentMovementDocument,
  SavingsMovement,
  SavingsMovementDocument,
  SavingsPlan,
  SavingsPlanDocument,
  Transaction,
  TransactionDocument,
  Wallet,
  WalletDocument,
} from '../../../shared/database/entity.schemas';
import {
  HouseholdMember,
  HouseholdMemberDocument,
  MEMBER_STATUS,
} from '../infrastructure/household.schemas';
import { HouseholdAuthzService } from './household-authz.service';

function toPlainList(docs: object[]) {
  return docs.map((doc) => {
    const { _id, __v, ...rest } = doc as Record<string, unknown>;
    return rest;
  });
}

@Injectable()
export class FamilyViewService {
  constructor(
    @InjectModel(HouseholdMember.name)
    private readonly memberModel: Model<HouseholdMemberDocument>,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Investment.name)
    private readonly investmentModel: Model<InvestmentDocument>,
    @InjectModel(InvestmentMovement.name)
    private readonly investmentMovementModel: Model<InvestmentMovementDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Budget.name)
    private readonly budgetModel: Model<BudgetDocument>,
    @InjectModel(SavingsPlan.name)
    private readonly savingsPlanModel: Model<SavingsPlanDocument>,
    @InjectModel(SavingsMovement.name)
    private readonly savingsMovementModel: Model<SavingsMovementDocument>,
    private readonly authzService: HouseholdAuthzService,
  ) {}

  async getFamilyView(householdId: string, requestingUserId: string) {
    await this.authzService.assertActiveMember(requestingUserId, householdId);

    const members = await this.memberModel
      .find({ householdId, status: MEMBER_STATUS.ACTIVE })
      .lean();

    const memberViews = await Promise.all(
      members.map(async (member) => {
        const privacy = member.privacySettings;
        const privateFilter = {
          userId: member.userId,
          $or: [{ householdId: { $exists: false } }, { householdId: null }],
          deletedAtMillis: { $exists: false },
        };

        const [wallets, transactions, investments, investmentMovements, categories] =
          await Promise.all([
            privacy.shareWallets
              ? this.walletModel.find(privateFilter).lean()
              : Promise.resolve([]),
            privacy.shareTransactions
              ? this.transactionModel.find(privateFilter).lean()
              : Promise.resolve([]),
            privacy.shareInvestments
              ? this.investmentModel.find(privateFilter).lean()
              : Promise.resolve([]),
            privacy.shareInvestments
              ? this.investmentMovementModel
                  .find({
                    userId: member.userId,
                    $or: [
                      { householdId: { $exists: false } },
                      { householdId: null },
                    ],
                    deletedAtMillis: { $exists: false },
                  })
                  .lean()
              : Promise.resolve([]),
            privacy.shareCategories
              ? this.categoryModel.find(privateFilter).lean()
              : Promise.resolve([]),
          ]);

        return {
          userId: member.userId,
          displayName: member.displayName,
          email: member.email,
          role: member.role,
          privacySettings: privacy,
          sharedData: {
            wallets: toPlainList(wallets),
            transactions: toPlainList(transactions),
            investments: toPlainList(investments),
            investmentMovements: toPlainList(investmentMovements),
            categories: toPlainList(categories),
          },
        };
      }),
    );

    const sharedFilter = {
      householdId,
      deletedAtMillis: { $exists: false },
    };

    const [sharedWallets, sharedTransactions, sharedInvestments, sharedInvestmentMovements, sharedCategories, sharedBudgets, sharedSavingsPlans, sharedSavingsMovements] =
      await Promise.all([
        this.walletModel.find(sharedFilter).lean(),
        this.transactionModel.find(sharedFilter).lean(),
        this.investmentModel.find(sharedFilter).lean(),
        this.investmentMovementModel.find(sharedFilter).lean(),
        this.categoryModel.find(sharedFilter).lean(),
        this.budgetModel.find(sharedFilter).lean(),
        this.savingsPlanModel.find(sharedFilter).lean(),
        this.savingsMovementModel.find(sharedFilter).lean(),
      ]);

    return {
      householdId,
      members: memberViews,
      householdShared: {
        wallets: toPlainList(sharedWallets),
        transactions: toPlainList(sharedTransactions),
        investments: toPlainList(sharedInvestments),
        investmentMovements: toPlainList(sharedInvestmentMovements),
        categories: toPlainList(sharedCategories),
        budgets: toPlainList(sharedBudgets),
        savingsPlans: toPlainList(sharedSavingsPlans),
        savingsMovements: toPlainList(sharedSavingsMovements),
      },
      generatedAtMillis: Date.now(),
    };
  }
}
