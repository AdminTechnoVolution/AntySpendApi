import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  DeveloperNotification,
  PubSubPushBody,
} from './rtdn.types';

@Injectable()
export class RtdnDecoderService {
  decodePushBody(body: PubSubPushBody): {
    messageId: string;
    notification: DeveloperNotification;
  } {
    const messageId = body.message?.messageId;
    const data = body.message?.data;

    if (!messageId) {
      throw new BadRequestException('PUBSUB_MESSAGE_ID_MISSING');
    }
    if (!data) {
      throw new BadRequestException('PUBSUB_MESSAGE_DATA_MISSING');
    }

    let notification: DeveloperNotification;
    try {
      const json = Buffer.from(data, 'base64').toString('utf8');
      notification = JSON.parse(json) as DeveloperNotification;
    } catch {
      throw new BadRequestException('RTDN_PAYLOAD_DECODE_FAILED');
    }

    return { messageId, notification };
  }
}
