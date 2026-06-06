import { decideLww } from '../sync/lww.service';
import { SyncableCrudService } from './syncable-crud.service';

describe('SyncableCrudService', () => {
  const findOneAndUpdate = jest.fn();
  const findOne = jest.fn();
  const model = { findOneAndUpdate, findOne };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upserts on create with client-provided id', async () => {
    const created = { id: 'wallet-1', userId: 'user-1', name: 'Cash' };
    findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(created) });

    const service = new SyncableCrudService(model as never, 'Wallet');
    const result = await service.create('user-1', { id: 'wallet-1', name: 'Cash' });

    expect(result).toEqual(created);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user-1', id: 'wallet-1' },
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({
          id: 'wallet-1',
          userId: 'user-1',
          name: 'Cash',
        }),
      }),
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
  });

  it('derives stable id from Idempotency-Key header', async () => {
    const created = { id: 'derived-id', userId: 'user-1' };
    findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(created) });

    const service = new SyncableCrudService(model as never, 'Wallet');
    await service.create(
      'user-1',
      { name: 'Cash' },
      { idempotencyKey: 'retry-key-1' },
    );

    const call = findOneAndUpdate.mock.calls[0];
    expect(call[0]).toEqual({ userId: 'user-1', id: expect.any(String) });
    expect(call[0].id).toHaveLength(32);
  });

  it('upserts on update when entity does not exist', async () => {
    findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const upserted = { id: 'wallet-1', userId: 'user-1', name: 'Updated' };
    findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(upserted) });

    const service = new SyncableCrudService(model as never, 'Wallet');
    const result = await service.update('user-1', 'wallet-1', { name: 'Updated' });

    expect(result).toEqual(upserted);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user-1', id: 'wallet-1' },
      expect.any(Object),
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
  });

  it('returns existing doc without write when LWW is noop', async () => {
    const existing = {
      id: 'wallet-1',
      userId: 'user-1',
      updatedAtMillis: 1000,
      deviceId: 'device-a',
      name: 'Cash',
    };
    findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(existing) });

    const service = new SyncableCrudService(model as never, 'Wallet');
    const result = await service.update(
      'user-1',
      'wallet-1',
      { name: 'Changed', updatedAtMillis: 1000 },
      { deviceId: 'device-a' },
    );

    expect(result).toEqual(existing);
    expect(findOneAndUpdate).not.toHaveBeenCalled();
    expect(decideLww(
      { updatedAtMillis: 1000, deviceId: 'device-a' },
      1000,
      'device-a',
    ).outcome).toBe('noop');
  });
});
