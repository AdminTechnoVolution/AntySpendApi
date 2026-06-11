import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Budget,
  BudgetDocument,
  BudgetMemberQuota,
  BudgetMemberQuotaDocument,
  ExpenseSplit,
  ExpenseSplitDocument,
  ExpenseSplitLine,
  ExpenseSplitLineDocument,
  Settlement,
  SettlementDocument,
} from '../../../shared/database/entity.schemas';
import { newEntityId } from '../../../shared/crud/syncable-crud.service';
import { HouseholdAuthzService } from './household-authz.service';
import {
  CreateExpenseSplitDto,
  CreateSettlementDto,
  ReplaceBudgetQuotasDto,
  UpdateExpenseSplitDto,
} from '../dto/household-family.dto';

type SplitWithLines = ExpenseSplit & { lines: ExpenseSplitLine[] };

@Injectable()
export class HouseholdFamilyService {
  constructor(
    private readonly authz: HouseholdAuthzService,
    @InjectModel(ExpenseSplit.name)
    private readonly expenseSplitModel: Model<ExpenseSplitDocument>,
    @InjectModel(ExpenseSplitLine.name)
    private readonly expenseSplitLineModel: Model<ExpenseSplitLineDocument>,
    @InjectModel(Settlement.name)
    private readonly settlementModel: Model<SettlementDocument>,
    @InjectModel(BudgetMemberQuota.name)
    private readonly budgetMemberQuotaModel: Model<BudgetMemberQuotaDocument>,
    @InjectModel(Budget.name)
    private readonly budgetModel: Model<BudgetDocument>,
  ) {}

  async listSplits(
    userId: string,
    householdId: string,
    status?: string,
  ): Promise<SplitWithLines[]> {
    await this.authz.assertActiveMember(userId, householdId);
    const filter: Record<string, unknown> = {
      householdId,
      deletedAtMillis: { $exists: false },
    };
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'OPEN';
    }
    const splits = await this.expenseSplitModel.find(filter).lean();
    return Promise.all(
      splits.map(async (split) => ({
        ...split,
        lines: await this.expenseSplitLineModel
          .find({
            expenseSplitId: split.id,
            deletedAtMillis: { $exists: false },
          })
          .lean(),
      })),
    );
  }

  async createSplit(
    userId: string,
    householdId: string,
    body: CreateExpenseSplitDto,
    idempotencyKey?: string,
  ): Promise<SplitWithLines> {
    await this.authz.assertActiveMember(userId, householdId);
    const existing = await this.expenseSplitModel
      .findOne({
        householdId,
        transactionId: body.transactionId,
        deletedAtMillis: { $exists: false },
      })
      .lean();
    if (existing) {
      throw new BadRequestException('SPLIT_ALREADY_EXISTS');
    }
    const now = Date.now();
    const splitId = idempotencyKey
      ? idempotencyKey.slice(0, 32)
      : newEntityId();
    const split = await this.expenseSplitModel
      .findOneAndUpdate(
        { userId, id: splitId },
        {
          $setOnInsert: {
            id: splitId,
            userId,
            householdId,
            createdByUserId: userId,
            transactionId: body.transactionId,
            paidByUserId: body.paidByUserId,
            splitMethod: body.splitMethod,
            totalAmountMinor: body.totalAmountMinor,
            currencyCode: body.currencyCode,
            note: body.note,
            status: 'OPEN',
            createdAtMillis: now,
            updatedAtMillis: now,
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      )
      .lean();
    const lines: ExpenseSplitLine[] = [];
    for (const line of body.lines) {
      const lineId = newEntityId();
      const saved = await this.expenseSplitLineModel
        .findOneAndUpdate(
          { userId, id: lineId },
          {
            $setOnInsert: {
              id: lineId,
              userId,
              householdId,
              createdByUserId: userId,
              expenseSplitId: splitId,
              participantUserId: line.participantUserId,
              owedAmountMinor: line.owedAmountMinor,
              createdAtMillis: now,
              updatedAtMillis: now,
            },
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
        )
        .lean();
      lines.push(saved);
    }
    return { ...split!, lines };
  }

  async updateSplit(
    userId: string,
    householdId: string,
    splitId: string,
    body: UpdateExpenseSplitDto,
  ): Promise<SplitWithLines> {
    await this.authz.assertActiveMember(userId, householdId);
    const existing = await this.expenseSplitModel
      .findOne({
        householdId,
        id: splitId,
        deletedAtMillis: { $exists: false },
      })
      .lean();
    if (!existing) {
      throw new NotFoundException('SPLIT_NOT_FOUND');
    }
    const now = Date.now();
    const updated = await this.expenseSplitModel
      .findOneAndUpdate(
        { id: splitId, householdId },
        {
          $set: {
            ...(body.status ? { status: body.status } : {}),
            ...(body.note !== undefined ? { note: body.note } : {}),
            updatedAtMillis: now,
          },
        },
        { returnDocument: 'after' },
      )
      .lean();
    const lines = await this.expenseSplitLineModel
      .find({
        expenseSplitId: splitId,
        deletedAtMillis: { $exists: false },
      })
      .lean();
    return { ...updated!, lines };
  }

  async createSettlement(
    userId: string,
    householdId: string,
    body: CreateSettlementDto,
    idempotencyKey?: string,
  ): Promise<Settlement> {
    await this.authz.assertActiveMember(userId, householdId);
    const now = Date.now();
    const id = idempotencyKey ? idempotencyKey.slice(0, 32) : newEntityId();
    const doc = await this.settlementModel
      .findOneAndUpdate(
        { userId, id },
        {
          $setOnInsert: {
            id,
            userId,
            householdId,
            createdByUserId: userId,
            fromUserId: body.fromUserId,
            toUserId: body.toUserId,
            amountMinor: body.amountMinor,
            currencyCode: body.currencyCode,
            linkedTransactionId: body.linkedTransactionId,
            note: body.note,
            settledAtMillis: body.settledAtMillis ?? now,
            createdAtMillis: now,
            updatedAtMillis: now,
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      )
      .lean();
    return doc!;
  }

  async listSettlements(
    userId: string,
    householdId: string,
  ): Promise<Settlement[]> {
    await this.authz.assertActiveMember(userId, householdId);
    return this.settlementModel
      .find({ householdId, deletedAtMillis: { $exists: false } })
      .sort({ settledAtMillis: -1 })
      .lean();
  }

  async getBalances(userId: string, householdId: string) {
    await this.authz.assertActiveMember(userId, householdId);
    const memberIds = await this.authz.getActiveMemberUserIds(householdId);
    const splits = await this.listSplits(userId, householdId, 'OPEN');
    const settlements = await this.listSettlements(userId, householdId);
    const nets = new Map<string, number>(memberIds.map((id) => [id, 0]));

    for (const split of splits) {
      const payer = split.paidByUserId;
      for (const line of split.lines) {
        if (line.participantUserId === payer) continue;
        nets.set(payer, (nets.get(payer) ?? 0) + line.owedAmountMinor);
        nets.set(
          line.participantUserId,
          (nets.get(line.participantUserId) ?? 0) - line.owedAmountMinor,
        );
      }
    }

    for (const settlement of settlements) {
      nets.set(
        settlement.fromUserId,
        (nets.get(settlement.fromUserId) ?? 0) + settlement.amountMinor,
      );
      nets.set(
        settlement.toUserId,
        (nets.get(settlement.toUserId) ?? 0) - settlement.amountMinor,
      );
    }

    return {
      balances: [...nets.entries()].map(
        ([memberUserId, netOwedPrimaryMinor]) => ({
          userId: memberUserId,
          netOwedPrimaryMinor,
        }),
      ),
    };
  }

  async replaceBudgetQuotas(
    userId: string,
    householdId: string,
    budgetId: string,
    body: ReplaceBudgetQuotasDto,
  ): Promise<BudgetMemberQuota[]> {
    await this.authz.assertOwner(userId, householdId);
    const budget = await this.budgetModel
      .findOne({
        householdId,
        id: budgetId,
        deletedAtMillis: { $exists: false },
      })
      .lean();
    if (!budget) {
      throw new NotFoundException('BUDGET_NOT_FOUND');
    }
    const sum = body.quotas.reduce((acc, q) => acc + q.quotaPercent, 0);
    if (sum !== 100) {
      throw new BadRequestException('QUOTAS_MUST_SUM_100');
    }
    const now = Date.now();
    await this.budgetMemberQuotaModel.updateMany(
      { householdId, budgetId, deletedAtMillis: { $exists: false } },
      { $set: { deletedAtMillis: now, updatedAtMillis: now } },
    );
    const saved: BudgetMemberQuota[] = [];
    for (const quota of body.quotas) {
      const id = newEntityId();
      const doc = await this.budgetMemberQuotaModel
        .findOneAndUpdate(
          { householdId, budgetId, memberUserId: quota.userId },
          {
            $set: {
              id,
              userId,
              memberUserId: quota.userId,
              householdId,
              createdByUserId: userId,
              budgetId,
              quotaPercent: quota.quotaPercent,
              updatedAtMillis: now,
              deletedAtMillis: undefined,
            },
            $setOnInsert: {
              createdAtMillis: now,
            },
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
        )
        .lean();
      saved.push(doc!);
    }
    return saved;
  }

  async listBudgetQuotas(
    userId: string,
    householdId: string,
    budgetId: string,
  ): Promise<BudgetMemberQuota[]> {
    await this.authz.assertActiveMember(userId, householdId);
    const budget = await this.budgetModel
      .findOne({
        householdId,
        id: budgetId,
        deletedAtMillis: { $exists: false },
      })
      .lean();
    if (!budget) {
      throw new NotFoundException('BUDGET_NOT_FOUND');
    }
    return this.budgetMemberQuotaModel
      .find({ householdId, budgetId, deletedAtMillis: { $exists: false } })
      .lean();
  }
}
