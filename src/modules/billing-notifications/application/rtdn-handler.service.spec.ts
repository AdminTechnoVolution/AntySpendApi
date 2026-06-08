import { RtdnHandlerService } from './rtdn-handler.service';
import { RtdnDecoderService } from './rtdn-decoder.service';
import { EntitlementsService } from '../../households/application/entitlements.service';
import { RTDN_NOTIFICATION_TYPE } from '../../../shared/billing/rtdn.constants';

describe('RtdnHandlerService', () => {
  const decodePushBody = jest.fn();
  const decoder = { decodePushBody } as unknown as RtdnDecoderService;

  const syncEntitlementFromPlayByToken = jest.fn();
  const entitlementsService = {
    syncEntitlementFromPlayByToken,
  } as unknown as EntitlementsService;

  const create = jest.fn();
  const eventModel = { create };

  let service: RtdnHandlerService;

  const developerNotification = {
    version: '1.0',
    packageName: 'com.technovolution.antyspend',
    subscriptionNotification: {
      version: '1.0',
      notificationType: RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RENEWED,
      purchaseToken: 'token-renewed',
      subscriptionId: 'antyspend_personal_monthly',
    },
  };

  const pushBody = {
    message: {
      data: 'ignored',
      messageId: 'msg-renewed',
    },
    subscription: 'projects/test/subscriptions/play-billing-rtdn-push',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RtdnHandlerService(
      decoder,
      entitlementsService,
      eventModel as never,
    );
    decodePushBody.mockReturnValue({
      messageId: 'msg-renewed',
      notification: developerNotification,
    });
    create.mockResolvedValue({});
    syncEntitlementFromPlayByToken.mockResolvedValue(undefined);
  });

  it('records event and syncs entitlement on subscription notification', async () => {
    await service.handlePush(pushBody);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        messageId: 'msg-renewed',
        purchaseToken: 'token-renewed',
        notificationType: RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RENEWED,
      }),
    );
    expect(syncEntitlementFromPlayByToken).toHaveBeenCalledWith(
      'token-renewed',
      'antyspend_personal_monthly',
      RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RENEWED,
    );
  });

  it('skips duplicate messageId without syncing again', async () => {
    create.mockRejectedValue({ code: 11000 });

    await service.handlePush(pushBody);

    expect(syncEntitlementFromPlayByToken).not.toHaveBeenCalled();
  });

  it('records non-subscription notifications without syncing', async () => {
    decodePushBody.mockReturnValue({
      messageId: 'msg-test',
      notification: {
        version: '1.0',
        testNotification: { version: '1.0' },
      },
    });

    await service.handlePush({
      message: { messageId: 'msg-test', data: 'x' },
    });

    expect(create).toHaveBeenCalled();
    expect(syncEntitlementFromPlayByToken).not.toHaveBeenCalled();
  });
});
