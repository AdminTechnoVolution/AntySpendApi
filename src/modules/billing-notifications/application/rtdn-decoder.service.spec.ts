import { BadRequestException } from '@nestjs/common';
import { RtdnDecoderService } from './rtdn-decoder.service';

describe('RtdnDecoderService', () => {
  let service: RtdnDecoderService;

  const developerNotification = {
    version: '1.0',
    packageName: 'com.technovolution.antyspend',
    eventTimeMillis: '1234567890123',
    subscriptionNotification: {
      version: '1.0',
      notificationType: 2,
      purchaseToken: 'test-purchase-token',
      subscriptionId: 'antyspend_personal_monthly',
    },
  };

  const encodedData = Buffer.from(JSON.stringify(developerNotification)).toString(
    'base64',
  );

  beforeEach(() => {
    service = new RtdnDecoderService();
  });

  it('decodes a valid Pub/Sub push body', () => {
    const result = service.decodePushBody({
      message: {
        data: encodedData,
        messageId: 'msg-123',
        publishTime: '2024-01-01T00:00:00.000Z',
      },
      subscription: 'projects/test/subscriptions/play-billing-rtdn-push',
    });

    expect(result.messageId).toBe('msg-123');
    expect(result.notification.subscriptionNotification).toEqual(
      developerNotification.subscriptionNotification,
    );
  });

  it('rejects missing messageId', () => {
    expect(() =>
      service.decodePushBody({
        message: { data: encodedData },
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects missing data', () => {
    expect(() =>
      service.decodePushBody({
        message: { messageId: 'msg-456' },
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects invalid base64 JSON', () => {
    expect(() =>
      service.decodePushBody({
        message: {
          messageId: 'msg-789',
          data: Buffer.from('not-json').toString('base64'),
        },
      }),
    ).toThrow(BadRequestException);
  });
});
