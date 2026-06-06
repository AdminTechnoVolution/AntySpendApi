import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SyncChange } from './sync.types';
import { SyncMetadata, SyncMetadataDocument } from './sync-metadata.schema';

export type LwwOutcome = 'accept' | 'reject' | 'noop';

export interface LwwDecision {
  outcome: LwwOutcome;
  reason?: string;
}

export function decideLww(
  clientChange: Pick<SyncChange, 'updatedAtMillis' | 'deviceId'>,
  serverUpdatedAtMillis: number | undefined,
  serverDeviceId: string | undefined,
): LwwDecision {
  if (serverUpdatedAtMillis === undefined) {
    return { outcome: 'accept' };
  }
  if (clientChange.updatedAtMillis > serverUpdatedAtMillis) {
    return { outcome: 'accept' };
  }
  if (clientChange.updatedAtMillis < serverUpdatedAtMillis) {
    return { outcome: 'reject', reason: 'SERVER_NEWER' };
  }

  const clientDevice = clientChange.deviceId ?? '';
  const serverDevice = serverDeviceId ?? '';
  if (clientDevice === serverDevice) {
    return { outcome: 'noop', reason: 'ALREADY_APPLIED' };
  }
  if (clientDevice > serverDevice) {
    return { outcome: 'accept' };
  }
  return { outcome: 'reject', reason: 'SERVER_WINS_TIE' };
}

@Injectable()
export class LwwService {
  constructor(
    @InjectModel(SyncMetadata.name)
    private readonly syncMetadataModel: Model<SyncMetadataDocument>,
  ) {}

  decide(
    clientChange: SyncChange,
    serverUpdatedAtMillis: number | undefined,
    serverDeviceId: string | undefined,
  ): LwwDecision {
    return decideLww(clientChange, serverUpdatedAtMillis, serverDeviceId);
  }

  async bumpServerVersion(userId: string): Promise<string> {
    const now = Date.now();
    const updated = await this.syncMetadataModel.findOneAndUpdate(
      { userId },
      {
        $set: { lastUpdatedAtMillis: now },
        $inc: { serverVersion: 1 },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    return String(updated.serverVersion);
  }

  async getServerVersion(userId: string): Promise<string> {
    const doc = await this.syncMetadataModel.findOne({ userId }).lean();
    return String(doc?.serverVersion ?? 0);
  }
}
