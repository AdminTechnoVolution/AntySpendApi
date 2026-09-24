import { AppleNotificationHandlerService } from './apple-notification-handler.service';
import { AppleNotificationDecoderService } from './apple-notification-decoder.service';
import { EntitlementsService } from '../../households/application/entitlements.service';

describe('AppleNotificationHandlerService', () => {
  const decode = jest.fn();
  const decoder = { decode } as unknown as AppleNotificationDecoderService;

  const syncEntitlementFromAppleNotification = jest.fn();
  const entitlementsService = {
    syncEntitlementFromAppleNotification,
  } as unknown as EntitlementsService;

  const create = jest.fn();
  const eventModel = { create };

  let service: AppleNotificationHandlerService;

  const decodedRenewal = {
    notificationUUID: 'uuid-renew',
    notificationType: 'DID_RENEW',
    transaction: {
      transactionId: 'txn-2',
      originalTransactionId: 'original-txn-1',
      productId: 'com.technovolution.antyspend.personal.monthly',
      bundleId: 'com.technovolution.antyspend',
      expiresDate: 4_000_000_000_000,
      purchaseDate: 3_900_000_000_000,
      type: 'Auto-Renewable Subscription',
    },
    renewalInfo: {
      originalTransactionId: 'original-txn-1',
      productId: 'com.technovolution.antyspend.personal.monthly',
      autoRenewStatus: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AppleNotificationHandlerService(decoder, entitlementsService, eventModel as never);
  });

  it('records the event and syncs the entitlement by originalTransactionId', async () => {
    decode.mockResolvedValue(decodedRenewal);
    create.mockResolvedValue({});

    await service.handleNotification({ signedPayload: 'jws' });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ messageId: 'uuid-renew', appleNotificationType: 'DID_RENEW' }),
    );
    expect(syncEntitlementFromAppleNotification).toHaveBeenCalledWith(
      'original-txn-1',
      'com.technovolution.antyspend.personal.monthly',
      4_000_000_000_000,
      1,
      'DID_RENEW',
    );
  });

  it('skips duplicate notifications without re-syncing the entitlement', async () => {
    decode.mockResolvedValue(decodedRenewal);
    create.mockRejectedValue({ code: 11000 });

    await service.handleNotification({ signedPayload: 'jws' });

    expect(syncEntitlementFromAppleNotification).not.toHaveBeenCalled();
  });

  it('records notifications with no transaction payload without syncing anything', async () => {
    decode.mockResolvedValue({ notificationUUID: 'uuid-consent', notificationType: 'CONSUMPTION_REQUEST' });
    create.mockResolvedValue({});

    await service.handleNotification({ signedPayload: 'jws' });

    expect(syncEntitlementFromAppleNotification).not.toHaveBeenCalled();
  });
});
