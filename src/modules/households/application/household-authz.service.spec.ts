import { ForbiddenException } from '@nestjs/common';
import { HouseholdAuthzService } from './household-authz.service';
import {
  MEMBER_ROLE,
  MEMBER_STATUS,
} from '../infrastructure/household.schemas';

const HOUSEHOLD_ID = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const OWNER_ID = 'owner-user';
const MEMBER_ID = 'member-user';

describe('HouseholdAuthzService', () => {
  const findOne = jest.fn();
  const find = jest.fn();
  const memberModel = { findOne, find };
  const householdFindOne = jest.fn();
  const householdModel = { findOne: householdFindOne };
  const hasActiveFamilyPlan = jest.fn();
  const entitlementsService = { hasActiveFamilyPlan };

  let service: HouseholdAuthzService;

  beforeEach(() => {
    jest.clearAllMocks();
    householdFindOne.mockReturnValue({
      lean: jest
        .fn()
        .mockResolvedValue({ id: HOUSEHOLD_ID, ownerUserId: OWNER_ID }),
    });
    hasActiveFamilyPlan.mockResolvedValue(true);
    service = new HouseholdAuthzService(
      memberModel as never,
      householdModel as never,
      entitlementsService as never,
    );
  });

  describe('authorizeSyncChange', () => {
    it('allows private entity changes without membership check', async () => {
      const result = await service.authorizeSyncChange(
        OWNER_ID,
        {
          entityType: 'wallets',
          entityId: 'wallet-1',
          updatedAtMillis: 1000,
          payload: { name: 'Private' },
        },
        null,
      );

      expect(result).toEqual({ allowed: true, isOwner: false });
      expect(findOne).not.toHaveBeenCalled();
    });

    it('rejects shared wallet create from non-owner member', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId: MEMBER_ID,
          householdId: HOUSEHOLD_ID,
          role: MEMBER_ROLE.MEMBER,
          status: MEMBER_STATUS.ACTIVE,
        }),
      });

      const result = await service.authorizeSyncChange(
        MEMBER_ID,
        {
          entityType: 'wallets',
          entityId: 'wallet-1',
          updatedAtMillis: 1000,
          payload: { name: 'Shared', householdId: HOUSEHOLD_ID },
        },
        null,
      );

      expect(result).toEqual({ allowed: false, reason: 'OWNER_ONLY' });
    });

    it('allows shared transaction create from any active member', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId: MEMBER_ID,
          householdId: HOUSEHOLD_ID,
          role: MEMBER_ROLE.MEMBER,
          status: MEMBER_STATUS.ACTIVE,
        }),
      });

      const result = await service.authorizeSyncChange(
        MEMBER_ID,
        {
          entityType: 'transactions',
          entityId: 'tx-1',
          updatedAtMillis: 1000,
          payload: { householdId: HOUSEHOLD_ID, type: 'EXPENSE' },
        },
        null,
      );

      expect(result).toEqual({
        allowed: true,
        householdId: HOUSEHOLD_ID,
        isOwner: false,
      });
    });

    it('rejects shared sync when the household owner family plan is inactive', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId: MEMBER_ID,
          householdId: HOUSEHOLD_ID,
          role: MEMBER_ROLE.MEMBER,
          status: MEMBER_STATUS.ACTIVE,
        }),
      });
      hasActiveFamilyPlan.mockResolvedValue(false);

      const result = await service.authorizeSyncChange(
        MEMBER_ID,
        {
          entityType: 'transactions',
          entityId: 'tx-1',
          updatedAtMillis: 1000,
          payload: { householdId: HOUSEHOLD_ID, type: 'EXPENSE' },
        },
        null,
      );

      expect(result).toEqual({
        allowed: false,
        reason: 'FAMILY_PLAN_INACTIVE',
      });
    });

    it('requires owner role for shared debt changes', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId: MEMBER_ID,
          householdId: HOUSEHOLD_ID,
          role: MEMBER_ROLE.MEMBER,
          status: MEMBER_STATUS.ACTIVE,
        }),
      });

      const result = await service.authorizeSyncChange(
        MEMBER_ID,
        {
          entityType: 'debt_accounts',
          entityId: 'debt-1',
          updatedAtMillis: 1000,
          payload: { householdId: HOUSEHOLD_ID, name: 'Mortgage' },
        },
        null,
      );

      expect(result).toEqual({ allowed: false, reason: 'OWNER_ONLY' });
    });

    it('rejects shared wallet delete from non-owner member', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId: MEMBER_ID,
          householdId: HOUSEHOLD_ID,
          role: MEMBER_ROLE.MEMBER,
          status: MEMBER_STATUS.ACTIVE,
        }),
      });

      const result = await service.authorizeSyncChange(
        MEMBER_ID,
        {
          entityType: 'wallets',
          entityId: 'wallet-1',
          updatedAtMillis: 1000,
          deletedAtMillis: 2000,
          payload: { householdId: HOUSEHOLD_ID },
        },
        { householdId: HOUSEHOLD_ID },
      );

      expect(result).toEqual({ allowed: false, reason: 'OWNER_ONLY' });
    });
  });

  describe('assertActiveMember', () => {
    it('throws when user is not an active member', async () => {
      findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await expect(
        service.assertActiveMember(MEMBER_ID, HOUSEHOLD_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
