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

describe('EntitlementsService', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();
  const entitlementModel = {
    findOne,
    findOneAndUpdate,
  };

  const verifySubscription = jest.fn();
  const productIdToPlanType = jest.fn();
  const playBilling = {
    verifySubscription,
    productIdToPlanType,
  } as unknown as PlayBillingVerificationService;

  const configGet = jest.fn();
  const config = { get: configGet };

  let service: EntitlementsService;

  const userId = '507f1f77bcf86cd799439011';
  const futureExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const pastExpiry = Date.now() - 60_000;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EntitlementsService(
      entitlementModel as never,
      playBilling,
      config as never,
    );
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
});
