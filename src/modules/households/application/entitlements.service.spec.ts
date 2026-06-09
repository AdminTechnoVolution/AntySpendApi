import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { EntitlementsService } from './entitlements.service';
import { PlayBillingVerificationService } from './play-billing-verification.service';
import {
  ENTITLEMENT_SOURCE,
  ENTITLEMENT_STATUS,
  PLAN_TYPE,
  PLAY_PRODUCT_FAMILY,
  PLAY_PRODUCT_PERSONAL,
} from '../infrastructure/household.schemas';
import { RTDN_NOTIFICATION_TYPE } from '../../../shared/billing/rtdn.constants';

describe('EntitlementsService', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();
  const updateOne = jest.fn();
  const entitlementModel = {
    findOne,
    findOneAndUpdate,
    updateOne,
  };

  const memberFindOne = jest.fn();
  const memberModel = { findOne: memberFindOne };

  const householdFindOne = jest.fn();
  const householdModel = { findOne: householdFindOne };

  const verifySubscription = jest.fn();
  const verifySubscriptionV2 = jest.fn();
  const productIdToPlanType = jest.fn();
  const playBilling = {
    verifySubscription,
    verifySubscriptionV2,
    productIdToPlanType,
  } as unknown as PlayBillingVerificationService;

  const configGet = jest.fn();
  const config = { get: configGet };

  let service: EntitlementsService;

  const userId = '507f1f77bcf86cd799439011';
  const ownerId = '507f1f77bcf86cd799439012';
  const householdId = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const futureExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const pastExpiry = Date.now() - 60_000;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EntitlementsService(
      entitlementModel as never,
      memberModel as never,
      householdModel as never,
      playBilling,
      config as never,
    );
    memberFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    householdFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    configGet.mockImplementation((key: string) => {
      if (key === 'googlePlay.packageName') {
        return 'com.technovolution.antyspend';
      }
      return undefined;
    });
    findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    findOneAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        userId,
        planType: PLAN_TYPE.PERSONAL,
        status: ENTITLEMENT_STATUS.ACTIVE,
        source: ENTITLEMENT_SOURCE.PLAY_STORE,
        expiresAtMillis: futureExpiry,
        googlePlayProductId: PLAY_PRODUCT_PERSONAL,
        autoRenewing: true,
      }),
    });
  });

  describe('getPlanType', () => {
    it('returns null when no entitlement exists', async () => {
      expect(await service.getPlanType(userId)).toBeNull();
    });

    it('returns PERSONAL only when ACTIVE and not expired', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          planType: PLAN_TYPE.PERSONAL,
          status: ENTITLEMENT_STATUS.ACTIVE,
          expiresAtMillis: futureExpiry,
        }),
      });

      expect(await service.getPlanType(userId)).toBe(PLAN_TYPE.PERSONAL);
    });

    it('returns null when status is EXPIRED', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          planType: PLAN_TYPE.PERSONAL,
          status: ENTITLEMENT_STATUS.EXPIRED,
          expiresAtMillis: pastExpiry,
        }),
      });

      expect(await service.getPlanType(userId)).toBeNull();
    });

    it('returns null when ACTIVE but past expiresAtMillis', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          planType: PLAN_TYPE.FAMILY,
          status: ENTITLEMENT_STATUS.ACTIVE,
          expiresAtMillis: pastExpiry,
        }),
      });

      expect(await service.getPlanType(userId)).toBeNull();
    });
  });

  describe('hasActiveFamilyPlan', () => {
    it('returns true for active FAMILY entitlement', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          planType: PLAN_TYPE.FAMILY,
          status: ENTITLEMENT_STATUS.ACTIVE,
          expiresAtMillis: futureExpiry,
        }),
      });

      expect(await service.hasActiveFamilyPlan(userId)).toBe(true);
    });

    it('returns false for active PERSONAL entitlement', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          planType: PLAN_TYPE.PERSONAL,
          status: ENTITLEMENT_STATUS.ACTIVE,
          expiresAtMillis: futureExpiry,
        }),
      });

      expect(await service.hasActiveFamilyPlan(userId)).toBe(false);
    });

    it('returns false when FAMILY entitlement is expired', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          planType: PLAN_TYPE.FAMILY,
          status: ENTITLEMENT_STATUS.EXPIRED,
          expiresAtMillis: pastExpiry,
        }),
      });

      expect(await service.hasActiveFamilyPlan(userId)).toBe(false);
    });
  });

  describe('requireFamilyPlan', () => {
    it('allows active FAMILY entitlement', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          planType: PLAN_TYPE.FAMILY,
          status: ENTITLEMENT_STATUS.ACTIVE,
          expiresAtMillis: futureExpiry,
        }),
      });

      await expect(service.requireFamilyPlan(userId)).resolves.toBeUndefined();
    });

    it('rejects when only PERSONAL is active', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          planType: PLAN_TYPE.PERSONAL,
          status: ENTITLEMENT_STATUS.ACTIVE,
          expiresAtMillis: futureExpiry,
        }),
      });

      await expect(service.requireFamilyPlan(userId)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('getMyEntitlement', () => {
    it('returns NONE snapshot when no document exists', async () => {
      const result = await service.getMyEntitlement(userId);

      expect(result).toEqual({
        userId,
        planType: null,
        status: ENTITLEMENT_STATUS.NONE,
        expiresAtMillis: null,
        productId: null,
        source: null,
        active: false,
        autoRenewing: null,
        premiumAccessActive: false,
        familyPlanBeneficiary: false,
      });
    });

    it('returns active entitlement with planType when valid', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId,
          planType: PLAN_TYPE.FAMILY,
          status: ENTITLEMENT_STATUS.ACTIVE,
          source: ENTITLEMENT_SOURCE.PLAY_STORE,
          expiresAtMillis: futureExpiry,
          googlePlayProductId: PLAY_PRODUCT_FAMILY,
          autoRenewing: true,
        }),
      });

      const result = await service.getMyEntitlement(userId);

      expect(result.active).toBe(true);
      expect(result.planType).toBe(PLAN_TYPE.FAMILY);
      expect(result.productId).toBe(PLAY_PRODUCT_FAMILY);
      expect(result.premiumAccessActive).toBe(true);
      expect(result.familyPlanBeneficiary).toBe(false);
    });

    it('grants premium via household when member has no own subscription', async () => {
      findOne.mockImplementation(({ userId: queriedUserId }: { userId: string }) => ({
        lean: jest.fn().mockResolvedValue(
          queriedUserId === ownerId
            ? {
                userId: ownerId,
                planType: PLAN_TYPE.FAMILY,
                status: ENTITLEMENT_STATUS.ACTIVE,
                expiresAtMillis: futureExpiry,
              }
            : null,
        ),
      }));
      memberFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          householdId,
          userId,
          status: 'ACTIVE',
        }),
      });
      householdFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          id: householdId,
          ownerUserId: ownerId,
        }),
      });

      const result = await service.getMyEntitlement(userId);

      expect(result.active).toBe(false);
      expect(result.premiumAccessActive).toBe(true);
      expect(result.familyPlanBeneficiary).toBe(true);
    });

    it('denies premium when household owner family plan is expired', async () => {
      findOne.mockImplementation(({ userId: queriedUserId }: { userId: string }) => ({
        lean: jest.fn().mockResolvedValue(
          queriedUserId === ownerId
            ? {
                userId: ownerId,
                planType: PLAN_TYPE.FAMILY,
                status: ENTITLEMENT_STATUS.EXPIRED,
                expiresAtMillis: pastExpiry,
              }
            : null,
        ),
      }));
      memberFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          householdId,
          userId,
          status: 'ACTIVE',
        }),
      });
      householdFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          id: householdId,
          ownerUserId: ownerId,
        }),
      });

      const result = await service.getMyEntitlement(userId);

      expect(result.active).toBe(false);
      expect(result.premiumAccessActive).toBe(false);
      expect(result.familyPlanBeneficiary).toBe(false);
    });

    it('keeps active own-only semantics for personal subscribers', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId,
          planType: PLAN_TYPE.PERSONAL,
          status: ENTITLEMENT_STATUS.ACTIVE,
          source: ENTITLEMENT_SOURCE.PLAY_STORE,
          expiresAtMillis: futureExpiry,
          googlePlayProductId: PLAY_PRODUCT_PERSONAL,
          autoRenewing: true,
        }),
      });

      const result = await service.getMyEntitlement(userId);

      expect(result.active).toBe(true);
      expect(result.premiumAccessActive).toBe(true);
      expect(result.familyPlanBeneficiary).toBe(false);
      expect(memberFindOne).not.toHaveBeenCalled();
    });
  });

  describe('verifyPurchase', () => {
    it('verifies with Play API and upserts ACTIVE entitlement', async () => {
      verifySubscription.mockResolvedValue({
        expiryTimeMillis: futureExpiry,
        autoRenewing: true,
        orderId: 'GPA.1234',
        paymentState: 1,
      });
      productIdToPlanType.mockReturnValue(PLAN_TYPE.PERSONAL);

      const result = await service.verifyPurchase(
        userId,
        PLAY_PRODUCT_PERSONAL,
        'purchase-token',
      );

      expect(verifySubscription).toHaveBeenCalledWith(
        'purchase-token',
        PLAY_PRODUCT_PERSONAL,
      );
      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { userId },
        expect.objectContaining({
          $set: expect.objectContaining({
            planType: PLAN_TYPE.PERSONAL,
            status: ENTITLEMENT_STATUS.ACTIVE,
            googlePlayProductId: PLAY_PRODUCT_PERSONAL,
            googlePlayPurchaseToken: 'purchase-token',
            googlePlayOrderId: 'GPA.1234',
            packageName: 'com.technovolution.antyspend',
            autoRenewing: true,
            expiresAtMillis: futureExpiry,
          }),
        }),
        expect.objectContaining({ upsert: true }),
      );
      expect(result.active).toBe(true);
      expect(result.planType).toBe(PLAN_TYPE.PERSONAL);
    });

    it('upgrades PERSONAL to FAMILY when verifying family product', async () => {
      verifySubscription.mockResolvedValue({
        expiryTimeMillis: futureExpiry,
        autoRenewing: true,
        orderId: 'GPA.5678',
      });
      productIdToPlanType.mockReturnValue(PLAN_TYPE.FAMILY);
      findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId,
          planType: PLAN_TYPE.FAMILY,
          status: ENTITLEMENT_STATUS.ACTIVE,
          source: ENTITLEMENT_SOURCE.PLAY_STORE,
          expiresAtMillis: futureExpiry,
          googlePlayProductId: PLAY_PRODUCT_FAMILY,
          autoRenewing: true,
        }),
      });

      const result = await service.verifyPurchase(
        userId,
        PLAY_PRODUCT_FAMILY,
        'family-token',
      );

      expect(productIdToPlanType).toHaveBeenCalledWith(PLAY_PRODUCT_FAMILY);
      expect(result.planType).toBe(PLAN_TYPE.FAMILY);
    });

    it('marks entitlement EXPIRED when Play reports past expiry', async () => {
      verifySubscription.mockResolvedValue({
        expiryTimeMillis: pastExpiry,
        autoRenewing: false,
        orderId: 'GPA.expired',
      });
      productIdToPlanType.mockReturnValue(PLAN_TYPE.PERSONAL);
      findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId,
          planType: PLAN_TYPE.PERSONAL,
          status: ENTITLEMENT_STATUS.EXPIRED,
          source: ENTITLEMENT_SOURCE.PLAY_STORE,
          expiresAtMillis: pastExpiry,
          googlePlayProductId: PLAY_PRODUCT_PERSONAL,
          autoRenewing: false,
        }),
      });

      const result = await service.verifyPurchase(
        userId,
        PLAY_PRODUCT_PERSONAL,
        'expired-token',
      );

      expect(result.status).toBe(ENTITLEMENT_STATUS.EXPIRED);
      expect(result.active).toBe(false);
      expect(result.planType).toBeNull();
    });

    it('propagates unknown product errors from PlayBillingVerificationService', async () => {
      verifySubscription.mockResolvedValue({
        expiryTimeMillis: futureExpiry,
        autoRenewing: true,
        orderId: 'GPA.bad',
      });
      productIdToPlanType.mockImplementation(() => {
        throw new BadRequestException('UNKNOWN_PRODUCT_ID');
      });

      await expect(
        service.verifyPurchase(userId, 'unknown_product', 'token'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('syncEntitlementFromPlayByToken', () => {
    it('skips when no entitlement exists for purchase token', async () => {
      findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await service.syncEntitlementFromPlayByToken(
        'unknown-token',
        PLAY_PRODUCT_PERSONAL,
        RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RENEWED,
      );

      expect(verifySubscriptionV2).not.toHaveBeenCalled();
      expect(updateOne).not.toHaveBeenCalled();
    });

    it('re-verifies Play and updates entitlement on renewal', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId,
          googlePlayPurchaseToken: 'token-renewed',
          planType: PLAN_TYPE.PERSONAL,
          status: ENTITLEMENT_STATUS.ACTIVE,
        }),
      });
      verifySubscriptionV2.mockResolvedValue({
        expiryTimeMillis: futureExpiry,
        autoRenewing: true,
        orderId: 'GPA.renewed',
        productId: PLAY_PRODUCT_PERSONAL,
        subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
      });
      productIdToPlanType.mockReturnValue(PLAN_TYPE.PERSONAL);
      updateOne.mockResolvedValue({ modifiedCount: 1 });

      await service.syncEntitlementFromPlayByToken(
        'token-renewed',
        PLAY_PRODUCT_PERSONAL,
        RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RENEWED,
      );

      expect(verifySubscriptionV2).toHaveBeenCalledWith('token-renewed');
      expect(updateOne).toHaveBeenCalledWith(
        { googlePlayPurchaseToken: 'token-renewed' },
        {
          $set: expect.objectContaining({
            planType: PLAN_TYPE.PERSONAL,
            status: ENTITLEMENT_STATUS.ACTIVE,
            expiresAtMillis: futureExpiry,
            autoRenewing: true,
          }),
        },
      );
    });

    it('marks CANCELED when RTDN reports cancellation but not expired', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId,
          googlePlayPurchaseToken: 'token-cancel',
        }),
      });
      verifySubscriptionV2.mockResolvedValue({
        expiryTimeMillis: futureExpiry,
        autoRenewing: false,
        orderId: 'GPA.cancel',
        productId: PLAY_PRODUCT_PERSONAL,
        subscriptionState: 'SUBSCRIPTION_STATE_CANCELED',
      });
      productIdToPlanType.mockReturnValue(PLAN_TYPE.PERSONAL);
      updateOne.mockResolvedValue({ modifiedCount: 1 });

      await service.syncEntitlementFromPlayByToken(
        'token-cancel',
        PLAY_PRODUCT_PERSONAL,
        RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_CANCELED,
      );

      expect(updateOne).toHaveBeenCalledWith(
        { googlePlayPurchaseToken: 'token-cancel' },
        {
          $set: expect.objectContaining({
            status: ENTITLEMENT_STATUS.CANCELED,
          }),
        },
      );
    });

    it('marks EXPIRED on SUBSCRIPTION_EXPIRED notification', async () => {
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId,
          googlePlayPurchaseToken: 'token-expired',
        }),
      });
      verifySubscriptionV2.mockResolvedValue({
        expiryTimeMillis: pastExpiry,
        autoRenewing: false,
        orderId: 'GPA.expired',
        productId: PLAY_PRODUCT_PERSONAL,
        subscriptionState: 'SUBSCRIPTION_STATE_EXPIRED',
      });
      productIdToPlanType.mockReturnValue(PLAN_TYPE.PERSONAL);
      updateOne.mockResolvedValue({ modifiedCount: 1 });

      await service.syncEntitlementFromPlayByToken(
        'token-expired',
        PLAY_PRODUCT_PERSONAL,
        RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRED,
      );

      expect(updateOne).toHaveBeenCalledWith(
        { googlePlayPurchaseToken: 'token-expired' },
        {
          $set: expect.objectContaining({
            status: ENTITLEMENT_STATUS.EXPIRED,
          }),
        },
      );
    });
  });
});
