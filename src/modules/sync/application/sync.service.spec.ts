import { SyncService } from './sync.service';
import { LwwService } from '../../../shared/sync/lww.service';

const WALLET_ID = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

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
      id: WALLET_ID,
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
        entityId: WALLET_ID,
        updatedAtMillis: 1000,
        deviceId: 'device-a',
        payload: { name: 'Cash' },
      }],
      deviceId: 'device-a',
    });

    expect(result.noop).toEqual([WALLET_ID]);
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
        entityId: WALLET_ID,
        updatedAtMillis: 1000,
        payload: {
          name: 'Cash',
          createdAtMillis: 900,
        },
      }],
    });

    expect(result.accepted).toEqual([WALLET_ID]);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user-1', id: WALLET_ID },
      expect.objectContaining({
        $set: expect.not.objectContaining({ createdAtMillis: expect.anything() }),
        $setOnInsert: expect.objectContaining({ createdAtMillis: 900 }),
      }),
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    expect(lwwService.bumpServerVersion).toHaveBeenCalledWith('user-1');
  });

  it('strips malicious Mongo operator keys from payload before $set', async () => {
    findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    (lwwService.decide as jest.Mock).mockReturnValue({ outcome: 'accept' });
    findOneAndUpdate.mockResolvedValue({});

    await service.push('user-1', {
      changes: [{
        entityType: 'wallets',
        entityId: WALLET_ID,
        updatedAtMillis: 1000,
        payload: {
          name: 'Cash',
          $gt: '',
          'nested.bad': 1,
          meta: { $where: 'true', ok: true },
        },
      }],
    });

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user-1', id: WALLET_ID },
      expect.objectContaining({
        $set: expect.objectContaining({
          name: 'Cash',
          meta: { ok: true },
        }),
      }),
      expect.any(Object),
    );

    const updateArg = findOneAndUpdate.mock.calls[0][1] as {
      $set: Record<string, unknown>;
    };
    expect(updateArg.$set).not.toHaveProperty('$gt');
    expect(updateArg.$set).not.toHaveProperty('nested.bad');
    expect(updateArg.$set.meta).toEqual({ ok: true });
  });
});
