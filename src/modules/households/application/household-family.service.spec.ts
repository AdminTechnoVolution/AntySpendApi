import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HouseholdFamilyService } from './household-family.service';
import { HouseholdAuthzService } from './household-authz.service';

describe('HouseholdFamilyService', () => {
  const authz = {
    assertActiveMember: jest.fn(),
    assertOwner: jest.fn(),
    getActiveMemberUserIds: jest.fn(),
  } as unknown as HouseholdAuthzService;

  const expenseSplitFind = jest.fn();
  const expenseSplitFindOne = jest.fn();
  const expenseSplitFindOneAndUpdate = jest.fn();
  const expenseSplitModel = {
    find: expenseSplitFind,
    findOne: expenseSplitFindOne,
    findOneAndUpdate: expenseSplitFindOneAndUpdate,
  };

  const expenseSplitLineFind = jest.fn();
  const expenseSplitLineFindOneAndUpdate = jest.fn();
  const expenseSplitLineModel = {
    find: expenseSplitLineFind,
    findOneAndUpdate: expenseSplitLineFindOneAndUpdate,
  };

  const settlementFind = jest.fn();
  const settlementFindOneAndUpdate = jest.fn();
  const settlementModel = {
    find: settlementFind,
    findOneAndUpdate: settlementFindOneAndUpdate,
  };

  const budgetMemberQuotaFind = jest.fn();
  const budgetMemberQuotaUpdateMany = jest.fn();
  const budgetMemberQuotaFindOneAndUpdate = jest.fn();
  const budgetMemberQuotaModel = {
    find: budgetMemberQuotaFind,
    updateMany: budgetMemberQuotaUpdateMany,
    findOneAndUpdate: budgetMemberQuotaFindOneAndUpdate,
  };

  const budgetFindOne = jest.fn();
  const budgetModel = { findOne: budgetFindOne };

  let service: HouseholdFamilyService;

  const userId = 'owner-user';
  const householdId = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HouseholdFamilyService(
      authz,
      expenseSplitModel as never,
      expenseSplitLineModel as never,
      settlementModel as never,
      budgetMemberQuotaModel as never,
      budgetModel as never,
    );
    expenseSplitFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    expenseSplitLineFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    settlementFind.mockReturnValue({
      sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
    });
    (authz.getActiveMemberUserIds as jest.Mock).mockResolvedValue([userId, 'member-2']);
  });

  it('rejects quota replace when percents do not sum to 100', async () => {
    budgetFindOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ id: 'budget-1', householdId }),
    });

    await expect(
      service.replaceBudgetQuotas(userId, householdId, 'budget-1', {
        quotas: [
          { userId: 'member-1', quotaPercent: 40 },
          { userId: 'member-2', quotaPercent: 40 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns not found when updating missing split', async () => {
    expenseSplitFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

    await expect(
      service.updateSplit(userId, householdId, 'split-1', { status: 'SETTLED' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('computes net balances from open splits and settlements', async () => {
    expenseSplitFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          id: 'split-1',
          paidByUserId: userId,
          status: 'OPEN',
        },
      ]),
    });
    expenseSplitLineFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          expenseSplitId: 'split-1',
          participantUserId: 'member-2',
          owedAmountMinor: 500,
        },
      ]),
    });
    settlementFind.mockReturnValue({
      sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
    });

    const result = await service.getBalances(userId, householdId);

    expect(result.balances).toEqual(
      expect.arrayContaining([
        { userId, netOwedPrimaryMinor: 500 },
        { userId: 'member-2', netOwedPrimaryMinor: -500 },
      ]),
    );
  });
});
