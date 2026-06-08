import { BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';
import { PlayBillingVerificationService } from './play-billing-verification.service';
import {
  PLAN_TYPE,
  PLAY_PRODUCT_FAMILY,
  PLAY_PRODUCT_PERSONAL,
} from '../infrastructure/household.schemas';

const subscriptionsGet = jest.fn();

jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn().mockImplementation(() => ({})),
    },
    androidpublisher: jest.fn(),
  },
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(
    JSON.stringify({
      client_email: 'play@example.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----\n',
    }),
  ),
}));

describe('PlayBillingVerificationService', () => {
  const configGet = jest.fn();
  const config = { get: configGet };

  let service: PlayBillingVerificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    (google.androidpublisher as jest.Mock).mockReturnValue({
      purchases: {
        subscriptions: {
          get: subscriptionsGet,
        },
      },
    });
    service = new PlayBillingVerificationService(config as never);
    configGet.mockImplementation((key: string) => {
      if (key === 'googlePlay.packageName') {
        return 'com.technovolution.antyspend';
      }
      if (key === 'googlePlay.serviceAccountJson') {
        return '/secrets/play-sa.json';
      }
      return undefined;
    });
  });

  describe('verifySubscription', () => {
    it('maps Play API subscription response', async () => {
      const expiry = String(Date.now() + 86_400_000);
      subscriptionsGet.mockResolvedValue({
        data: {
          expiryTimeMillis: expiry,
          autoRenewing: true,
          orderId: 'GPA.9999',
          paymentState: 1,
        },
      });

      const result = await service.verifySubscription(
        'token-abc',
        PLAY_PRODUCT_PERSONAL,
      );

      expect(subscriptionsGet).toHaveBeenCalledWith({
        packageName: 'com.technovolution.antyspend',
        subscriptionId: PLAY_PRODUCT_PERSONAL,
        token: 'token-abc',
      });
      expect(result).toEqual({
        expiryTimeMillis: Number(expiry),
        autoRenewing: true,
        orderId: 'GPA.9999',
        paymentState: 1,
      });
    });

    it('rejects purchases without expiryTimeMillis', async () => {
      subscriptionsGet.mockResolvedValue({ data: {} });

      await expect(
        service.verifySubscription('bad-token', PLAY_PRODUCT_PERSONAL),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('productIdToPlanType', () => {
    it('maps personal product id', () => {
      expect(service.productIdToPlanType(PLAY_PRODUCT_PERSONAL)).toBe(
        PLAN_TYPE.PERSONAL,
      );
    });

    it('maps family product id', () => {
      expect(service.productIdToPlanType(PLAY_PRODUCT_FAMILY)).toBe(
        PLAN_TYPE.FAMILY,
      );
    });

    it('rejects unknown product ids', () => {
      expect(() => service.productIdToPlanType('unknown_sku')).toThrow(
        BadRequestException,
      );
    });
  });
});
