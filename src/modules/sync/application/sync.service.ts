import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LwwService } from '../../../shared/sync/lww.service';
import {
  SYNC_ENTITY_TYPES,
  SyncChange,
  SyncEntityType,
  SyncPullResult,
  SyncPushRequest,
  SyncPushResult,
} from '../../../shared/sync/sync.types';
import { sanitizeDocumentForStorage } from '../../../shared/security/strip-mongo-keys';
import {
  Budget,
  BudgetDocument,
  Category,
  CategoryDocument,
  Investment,
  InvestmentDocument,
  InvestmentMovement,
  InvestmentMovementDocument,
  Merchant,
  MerchantDocument,
  RecurringExpense,
  RecurringExpenseDocument,
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

type EntityModel = Model<Record<string, unknown>>;

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly entityMap: Record<SyncEntityType, EntityModel>;

  constructor(
    @InjectModel(UserSettings.name)
    settingsModel: Model<UserSettingsDocument>,
    @InjectModel(Wallet.name) walletModel: Model<WalletDocument>,
    @InjectModel(Category.name) categoryModel: Model<CategoryDocument>,
    @InjectModel(Merchant.name) merchantModel: Model<MerchantDocument>,
    @InjectModel(Transaction.name) transactionModel: Model<TransactionDocument>,
    @InjectModel(Budget.name) budgetModel: Model<BudgetDocument>,
    @InjectModel(RecurringExpense.name)
    recurringModel: Model<RecurringExpenseDocument>,
    @InjectModel(SavingsPlan.name) savingsPlanModel: Model<SavingsPlanDocument>,
    @InjectModel(SavingsMovement.name)
    savingsMovementModel: Model<SavingsMovementDocument>,
    @InjectModel(Investment.name) investmentModel: Model<InvestmentDocument>,
    @InjectModel(InvestmentMovement.name)
    investmentMovementModel: Model<InvestmentMovementDocument>,
    private readonly lwwService: LwwService,
  ) {
    this.entityMap = {
      settings: settingsModel as unknown as EntityModel,
      wallets: walletModel as unknown as EntityModel,
      categories: categoryModel as unknown as EntityModel,
      merchants: merchantModel as unknown as EntityModel,
      transactions: transactionModel as unknown as EntityModel,
      budgets: budgetModel as unknown as EntityModel,
      recurring_expenses: recurringModel as unknown as EntityModel,
      savings_plans: savingsPlanModel as unknown as EntityModel,
      savings_movements: savingsMovementModel as unknown as EntityModel,
      investments: investmentModel as unknown as EntityModel,
      investment_movements: investmentMovementModel as unknown as EntityModel,
    };
  }

  async push(userId: string, request: SyncPushRequest): Promise<SyncPushResult> {
    const accepted: string[] = [];
    const rejected: Array<{ entityId: string; reason: string }> = [];
    const noop: string[] = [];
    let hasMutations = false;

    for (const change of request.changes ?? []) {
      try {
        if (!SYNC_ENTITY_TYPES.includes(change.entityType)) {
          rejected.push({ entityId: change.entityId, reason: 'UNKNOWN_ENTITY' });
          continue;
        }

        const model = this.entityMap[change.entityType];
        const filter =
          change.entityType === 'settings'
            ? { userId }
            : { userId, id: change.entityId };

        const existing = (await model.findOne(filter).lean()) as
          | Record<string, unknown>
          | null;

        const decision = this.lwwService.decide(
          change,
          existing?.updatedAtMillis as number | undefined,
          existing?.deviceId as string | undefined,
        );

        if (decision.outcome === 'noop') {
          noop.push(change.entityId);
          continue;
        }

        if (decision.outcome === 'reject') {
          rejected.push({
            entityId: change.entityId,
            reason: decision.reason ?? 'REJECTED',
          });
          continue;
        }

        const now = Date.now();
        const deviceId = change.deviceId ?? request.deviceId;
        const entityPayload = sanitizeDocumentForStorage({ ...change.payload });
        delete entityPayload.createdAtMillis;
        delete entityPayload.id;
        delete entityPayload.userId;
        delete entityPayload.updatedAtMillis;
        delete entityPayload.deletedAtMillis;
        delete entityPayload.clientUpdatedAtMillis;
        delete entityPayload.deviceId;

        const payload = sanitizeDocumentForStorage({
          ...entityPayload,
          id:
            change.entityType === 'settings'
              ? (existing?.id ?? change.entityId)
              : change.entityId,
          userId,
          updatedAtMillis: change.updatedAtMillis,
          deviceId,
          ...(change.deletedAtMillis !== undefined
            ? { deletedAtMillis: change.deletedAtMillis }
            : {}),
          ...(change.clientUpdatedAtMillis !== undefined
            ? { clientUpdatedAtMillis: change.clientUpdatedAtMillis }
            : {}),
        });

        const createdAtMillis =
          (existing?.createdAtMillis as number | undefined) ??
          (change.payload.createdAtMillis as number | undefined) ??
          now;

        await model.findOneAndUpdate(
          filter,
          {
            $set: payload,
            $setOnInsert: { createdAtMillis },
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
        );

        accepted.push(change.entityId);
        hasMutations = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'UPSERT_FAILED';
        this.logger.warn(
          `Sync push failed for ${change.entityType}/${change.entityId}: ${message}`,
        );
        rejected.push({ entityId: change.entityId, reason: message });
      }
    }

    const serverVersion = hasMutations
      ? await this.lwwService.bumpServerVersion(userId)
      : await this.lwwService.getServerVersion(userId);

    return { accepted, rejected, noop, serverVersion };
  }

  async pull(userId: string, since?: string): Promise<SyncPullResult> {
    const currentVersion = await this.lwwService.getServerVersion(userId);
    if (since && since === currentVersion) {
      return { entities: [], newServerVersion: currentVersion };
    }

    const entities: SyncChange[] = [];
    for (const entityType of SYNC_ENTITY_TYPES) {
      const model = this.entityMap[entityType];
      const docs = await model
        .find({ userId })
        .sort({ updatedAtMillis: 1 })
        .lean();

      for (const doc of docs) {
        const record = doc as Record<string, unknown>;
        const { _id, __v, ...payload } = record;
        entities.push({
          entityType,
          entityId: (record.id as string) ?? userId,
          updatedAtMillis: record.updatedAtMillis as number,
          deletedAtMillis: record.deletedAtMillis as number | undefined,
          clientUpdatedAtMillis: record.clientUpdatedAtMillis as number | undefined,
          deviceId: record.deviceId as string | undefined,
          payload: payload as Record<string, unknown>,
        });
      }
    }

    return {
      entities,
      newServerVersion: currentVersion,
    };
  }
}
