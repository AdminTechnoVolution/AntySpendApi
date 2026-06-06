import { SyncService } from './sync.service';
import { LwwService } from '../../../shared/sync/lww.service';

describe('SyncService push idempotency', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();
  const model = { findOne, findOneAndUpdate, find: jest.fn() };

  const lwwService = {
    decide: jest.fn(),
    bumpServerVersion: jest.fn().mockResolvedValue('2'),
    getServerVersion: jest.fn().mockResolvedValue('1'),
  } as unknown as LwwService;

  const service = new SyncService(
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    lwwService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns noop for duplicate push without mutating or bumping version', async () => {
    findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({
      id: 'wallet-1',
      updatedAtMillis: 1000,
      deviceId: 'device-a',
    }) });
    (lwwService.decide as jest.Mock).mockReturnValue({
      outcome: 'noop',
      reason: 'ALREADY_APPLIED',
    });

    const result = await service.push('user-1', {
      changes: [{
        entityType: 'wallets',
        entityId: 'wallet-1',
        updatedAtMillis: 1000,
        deviceId: 'device-a',
        payload: { name: 'Cash' },
      }],
      deviceId: 'device-a',
    });

    expect(result.noop).toEqual(['wallet-1']);
    expect(result.accepted).toEqual([]);
    expect(result.rejected).toEqual([]);
    expect(findOneAndUpdate).not.toHaveBeenCalled();
    expect(lwwService.bumpServerVersion).not.toHaveBeenCalled();
    expect(lwwService.getServerVersion).toHaveBeenCalledWith('user-1');
  });

  it('upserts accepted changes keyed by userId and id', async () => {
    findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    (lwwService.decide as jest.Mock).mockReturnValue({ outcome: 'accept' });
    findOneAndUpdate.mockResolvedValue({});

    const result = await service.push('user-1', {
      changes: [{
        entityType: 'wallets',
        entityId: 'wallet-1',
        updatedAtMillis: 1000,
        payload: {
          name: 'Cash',
          createdAtMillis: 900,
        },
      }],
    });

    expect(result.accepted).toEqual(['wallet-1']);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user-1', id: 'wallet-1' },
      expect.objectContaining({
        $set: expect.not.objectContaining({ createdAtMillis: expect.anything() }),
        $setOnInsert: expect.objectContaining({ createdAtMillis: 900 }),
      }),
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    expect(lwwService.bumpServerVersion).toHaveBeenCalledWith('user-1');
  });
});
