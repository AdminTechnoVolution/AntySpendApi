import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import { decideLww } from '../sync/lww.service';

export function newEntityId(): string {
  return randomBytes(16).toString('hex');
}

function idFromIdempotencyKey(userId: string, idempotencyKey: string): string {
  return createHash('sha256')
    .update(`${userId}:${idempotencyKey}`)
    .digest('hex')
    .slice(0, 32);
}

export interface CrudWriteOptions {
  deviceId?: string;
  idempotencyKey?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModel = Model<any>;

@Injectable()
export class SyncableCrudService {
  constructor(
    private readonly model: AnyModel,
    private readonly entityName: string,
  ) {}

  async findAll(userId: string, includeDeleted = false) {
    const filter: Record<string, unknown> = { userId };
    if (!includeDeleted) {
      filter.deletedAtMillis = { $exists: false };
    }
    return this.model.find(filter).lean();
  }

  async findOne(userId: string, id: string) {
    const doc = await this.model.findOne({ userId, id }).lean();
    if (!doc || doc.deletedAtMillis) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return doc;
  }

  async create(
    userId: string,
    data: Record<string, unknown>,
    options: CrudWriteOptions = {},
  ) {
    const id =
      (data.id as string | undefined) ??
      (options.idempotencyKey
        ? idFromIdempotencyKey(userId, options.idempotencyKey)
        : newEntityId());
    const now = Date.now();

    const doc = await this.model
      .findOneAndUpdate(
        { userId, id },
        {
          $setOnInsert: {
            ...data,
            id,
            userId,
            createdAtMillis: now,
            updatedAtMillis: now,
            deviceId: options.deviceId,
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      )
      .lean();

    return doc;
  }

  async update(
    userId: string,
    id: string,
    data: Record<string, unknown>,
    options: CrudWriteOptions = {},
  ) {
    const existing = await this.model.findOne({ userId, id }).lean();
    const clientUpdatedAtMillis = data.updatedAtMillis as number | undefined;

    if (existing?.deletedAtMillis) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    if (existing && clientUpdatedAtMillis !== undefined) {
      const decision = decideLww(
        {
          updatedAtMillis: clientUpdatedAtMillis,
          deviceId: options.deviceId ?? (data.deviceId as string | undefined),
        },
        existing.updatedAtMillis as number,
        existing.deviceId as string | undefined,
      );

      if (decision.outcome === 'noop') {
        return existing;
      }
      if (decision.outcome === 'reject') {
        return existing;
      }
    }

    const now = Date.now();
    const { id: _ignoredId, userId: _ignoredUserId, ...fields } = data;
    const updatedAtMillis =
      clientUpdatedAtMillis ??
      (existing?.updatedAtMillis as number | undefined) ??
      now;

    const doc = await this.model
      .findOneAndUpdate(
        { userId, id },
        {
          $set: {
            ...fields,
            id,
            userId,
            updatedAtMillis,
            deviceId:
              options.deviceId ??
              (data.deviceId as string | undefined) ??
              (existing?.deviceId as string | undefined),
          },
          $setOnInsert: {
            createdAtMillis:
              (existing?.createdAtMillis as number | undefined) ?? now,
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      )
      .lean();

    return doc;
  }

  async softDelete(userId: string, id: string, deviceId?: string) {
    const existing = await this.model.findOne({ userId, id });
    if (!existing || existing.deletedAtMillis) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    const now = Date.now();
    existing.deletedAtMillis = now;
    existing.updatedAtMillis = now;
    if (deviceId) existing.deviceId = deviceId;
    await existing.save();
    return { id, deleted: true };
  }

  getModel(): AnyModel {
    return this.model;
  }
}
