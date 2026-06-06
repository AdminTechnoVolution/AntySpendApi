import { Model } from 'mongoose';
import { LwwService } from '../../../shared/sync/lww.service';
import { SyncPullResult, SyncPushRequest, SyncPushResult } from '../../../shared/sync/sync.types';
import { BudgetDocument, CategoryDocument, InvestmentDocument, InvestmentMovementDocument, MerchantDocument, RecurringExpenseDocument, SavingsMovementDocument, SavingsPlanDocument, TransactionDocument, UserSettingsDocument, WalletDocument } from '../../../shared/database/entity.schemas';
export declare class SyncService {
    private readonly lwwService;
    private readonly logger;
    private readonly entityMap;
    constructor(settingsModel: Model<UserSettingsDocument>, walletModel: Model<WalletDocument>, categoryModel: Model<CategoryDocument>, merchantModel: Model<MerchantDocument>, transactionModel: Model<TransactionDocument>, budgetModel: Model<BudgetDocument>, recurringModel: Model<RecurringExpenseDocument>, savingsPlanModel: Model<SavingsPlanDocument>, savingsMovementModel: Model<SavingsMovementDocument>, investmentModel: Model<InvestmentDocument>, investmentMovementModel: Model<InvestmentMovementDocument>, lwwService: LwwService);
    push(userId: string, request: SyncPushRequest): Promise<SyncPushResult>;
    pull(userId: string, since?: string): Promise<SyncPullResult>;
}
