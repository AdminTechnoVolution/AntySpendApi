import { BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';
import { PlayBillingVerificationService } from './play-billing-verification.service';
import {
  PLAN_TYPE,
  PLAY_PRODUCT_FAMILY,
  PLAY_PRODUCT_PERSONAL,
} from '../infrastructure/household.schemas';

const subscriptionsGet = jest.fn();
const subscriptionsV2Get = jest.fn();

const validCredentials = {
  type: 'service_account',
  client_email: 'play@example.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----\n',
};

jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn().mockImplementation(() => ({})),
    },
    androidpublisher: jest.fn(),
  },
}));

jest.mock('../../../shared/billing/google-play-credentials.loader', () => ({
  ...jest.requireActual('../../../shared/billing/google-play-credentials.loader'),
  loadGooglePlayServiceAccountCredentials: jest.fn().mockReturnValue({
    type: 'service_account',
    client_email: 'play@example.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----\n',
  }),
}));

import { loadGooglePlayServiceAccountCredentials } from '../../../shared/billing/google-play-credentials.loader';

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
        subscriptionsv2: {
          get: subscriptionsV2Get,
        },
      },
    });
    (loadGooglePlayServiceAccountCredentials as jest.Mock).mockReturnValue(
      validCredentials,
    );
    service = new PlayBillingVerificationService(config as never);
    configGet.mockImplementation((key: string) => {
      if (key === 'googlePlay.packageName') {
        return 'com.technovolution.antyspend';
      }
      if (key === 'googlePlay.serviceAccountJsonBase64') {
        return Buffer.from(JSON.stringify(validCredentials), 'utf8').toString(
          'base64',
        );
      }
      if (key === 'googlePlay.serviceAccountJson') {
        return '';
      }
      return undefined;
    });
  });

  it('loads credentials via loader with config values', async () => {
    subscriptionsV2Get.mockResolvedValue({
      data: {
        subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
        latestOrderId: 'GPA.v2',
        lineItems: [
          {
            productId: PLAY_PRODUCT_PERSONAL,
            expiryTime: new Date(Date.now() + 86_400_000).toISOString(),
            autoRenewingPlan: { autoRenewEnabled: true },
          },
        ],
      },
    });

    await service.verifySubscriptionV2('token-v2');

    expect(loadGooglePlayServiceAccountCredentials).toHaveBeenCalledWith({
      serviceAccountJsonBase64: expect.any(String),
      serviceAccountJson: '',
    });
  });

  describe('verifySubscriptionV2', () => {
    it('maps Play subscriptionsv2 response', async () => {
      const expiryIso = new Date(Date.now() + 86_400_000).toISOString();
      subscriptionsV2Get.mockResolvedValue({
        data: {
          subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
          latestOrderId: 'GPA.v2',
          lineItems: [
            {
              productId: PLAY_PRODUCT_PERSONAL,
              expiryTime: expiryIso,
              autoRenewingPlan: { autoRenewEnabled: true },
            },
          ],
        },
      });

      const result = await service.verifySubscriptionV2('token-v2');

      expect(subscriptionsV2Get).toHaveBeenCalledWith({
        packageName: 'com.technovolution.antyspend',
        token: 'token-v2',
      });
      expect(result).toEqual({
        expiryTimeMillis: new Date(expiryIso).getTime(),
        autoRenewing: true,
        orderId: 'GPA.v2',
        productId: PLAY_PRODUCT_PERSONAL,
        subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
      });
    });

    it('rejects subscriptionsv2 without line item expiry', async () => {
      subscriptionsV2Get.mockResolvedValue({ data: { lineItems: [] } });

      await expect(service.verifySubscriptionV2('bad-token')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('verifySubscription', () => {
    it('prefers subscriptionsv2 when available', async () => {
      const expiryIso = new Date(Date.now() + 86_400_000).toISOString();
      subscriptionsV2Get.mockResolvedValue({
        data: {
          subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
          latestOrderId: 'GPA.v2',
          lineItems: [
            {
              productId: PLAY_PRODUCT_PERSONAL,
              expiryTime: expiryIso,
              autoRenewingPlan: { autoRenewEnabled: true },
            },
          ],
        },
      });

      const result = await service.verifySubscription(
        'token-abc',
        PLAY_PRODUCT_PERSONAL,
      );

      expect(subscriptionsV2Get).toHaveBeenCalled();
      expect(subscriptionsGet).not.toHaveBeenCalled();
      expect(result).toEqual({
        expiryTimeMillis: new Date(expiryIso).getTime(),
        autoRenewing: true,
        orderId: 'GPA.v2',
      });
    });

    it('falls back to subscriptions.get when v2 fails', async () => {
      subscriptionsV2Get.mockRejectedValue(new Error('v2 unavailable'));
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

    it('maps Play API subscription response via v1 fallback', async () => {
      subscriptionsV2Get.mockRejectedValue(new Error('v2 unavailable'));
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

    it('rejects purchases without expiryTimeMillis via v1 fallback', async () => {
      subscriptionsV2Get.mockRejectedValue(new Error('v2 unavailable'));
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
