import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { HouseholdService } from './household.service';
import { EntitlementsService } from './entitlements.service';
import {
  INVITE_STATUS,
  MEMBER_ROLE,
  MEMBER_STATUS,
} from '../infrastructure/household.schemas';

describe('HouseholdService', () => {
  const householdCreate = jest.fn();
  const householdFindOne = jest.fn();
  const householdModel = {
    create: householdCreate,
    findOne: householdFindOne,
  };

  const memberCreate = jest.fn();
  const memberFindOne = jest.fn();
  const memberCountDocuments = jest.fn();
  const memberDeleteOne = jest.fn();
  const memberFindOneAndUpdate = jest.fn();
  const memberFind = jest.fn();
  const memberModel = {
    create: memberCreate,
    findOne: memberFindOne,
    countDocuments: memberCountDocuments,
    deleteOne: memberDeleteOne,
    findOneAndUpdate: memberFindOneAndUpdate,
    find: memberFind,
  };

  const inviteCreate = jest.fn();
  const inviteFindOne = jest.fn();
  const inviteCountDocuments = jest.fn();
  const inviteUpdateOne = jest.fn();
  const inviteFind = jest.fn();
  const inviteModel = {
    create: inviteCreate,
    findOne: inviteFindOne,
    countDocuments: inviteCountDocuments,
    updateOne: inviteUpdateOne,
    find: inviteFind,
  };

  const userFindById = jest.fn();
  const userModel = { findById: userFindById };

  const requireFamilyPlan = jest.fn();
  const getPlanType = jest.fn();
  const entitlementsService = {
    requireFamilyPlan,
    getPlanType,
  } as unknown as EntitlementsService;

  let service: HouseholdService;

  const ownerId = '507f1f77bcf86cd799439011';
  const memberId = '507f1f77bcf86cd799439012';
  const householdId = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HouseholdService(
      householdModel as never,
      memberModel as never,
      inviteModel as never,
      userModel as never,
      entitlementsService,
    );

    householdFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    memberFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    memberFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    inviteFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    memberCountDocuments.mockResolvedValue(1);
    inviteCountDocuments.mockResolvedValue(0);
    getPlanType.mockResolvedValue('PERSONAL');
    userFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: ownerId,
        name: 'Owner',
        email: 'owner@example.com',
      }),
    });
  });

  describe('getMyHousehold', () => {
    it('includes planType from entitlements even without a household', async () => {
      getPlanType.mockResolvedValue('FAMILY');

      const result = await service.getMyHousehold(ownerId);

      expect(getPlanType).toHaveBeenCalledWith(ownerId);
      expect(result.planType).toBe('FAMILY');
      expect(result.household).toBeNull();
    });
  });

  describe('createHousehold', () => {
    it('requires FAMILY entitlement', async () => {
      requireFamilyPlan.mockRejectedValue(
        new ForbiddenException('FAMILY_PLAN_REQUIRED'),
      );

      await expect(service.createHousehold(ownerId)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('rejects when user already belongs to a household', async () => {
      requireFamilyPlan.mockResolvedValue(undefined);
      memberFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          householdId,
          status: MEMBER_STATUS.ACTIVE,
        }),
      });

      await expect(service.createHousehold(ownerId)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('acceptInvite', () => {
    const token = 'invite-token-hex';

    it('rejects when invite email does not match authenticated user', async () => {
      inviteFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          id: 'invite-1',
          householdId,
          token,
          email: 'other@example.com',
          status: INVITE_STATUS.PENDING,
          expiresAtMillis: Date.now() + 60_000,
        }),
      });

      await expect(
        service.acceptInvite(token, memberId, 'member@example.com'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects when user already in an active household', async () => {
      inviteFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          id: 'invite-1',
          householdId,
          token,
          status: INVITE_STATUS.PENDING,
          expiresAtMillis: Date.now() + 60_000,
        }),
      });
      memberFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          householdId: 'other-household',
          status: MEMBER_STATUS.ACTIVE,
        }),
      });

      await expect(
        service.acceptInvite(token, memberId, 'member@example.com'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('enforces max member limit including pending invites', async () => {
      inviteFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          id: 'invite-1',
          householdId,
          token,
          status: INVITE_STATUS.PENDING,
          expiresAtMillis: Date.now() + 60_000,
        }),
      });
      memberCountDocuments.mockResolvedValue(5);
      inviteCountDocuments.mockResolvedValue(0);

      await expect(
        service.acceptInvite(token, memberId, 'member@example.com'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('removeMember', () => {
    it('prevents owner from removing themselves', async () => {
      memberFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          role: MEMBER_ROLE.OWNER,
          status: MEMBER_STATUS.ACTIVE,
        }),
      });

      await expect(
        service.removeMember(householdId, ownerId, ownerId),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
