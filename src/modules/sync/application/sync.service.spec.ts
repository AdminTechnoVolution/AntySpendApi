import { SyncService } from './sync.service';
import { LwwService } from '../../../shared/sync/lww.service';
import { HouseholdAuthzService } from '../../households/application/household-authz.service';

const WALLET_ID = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const HOUSEHOLD_ID = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

describe('SyncService push idempotency', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();
  const find = jest.fn();
  const model = { findOne, findOneAndUpdate, find };

  const lwwService = {
    decide: jest.fn(),
    bumpServerVersion: jest.fn().mockResolvedValue('2'),
    bumpServerVersionForUsers: jest.fn().mockResolvedValue(undefined),
    getServerVersion: jest.fn().mockResolvedValue('1'),
  } as unknown as LwwService;

  const householdAuthz = {
    resolveHouseholdId: jest.fn().mockReturnValue(undefined),
    buildEntityFilter: jest.fn(
      (userId: string, change: { entityId: string }) => ({
        userId,
        id: change.entityId,
        householdId: { $exists: false },
      }),
    ),
    authorizeSyncChange: jest
      .fn()
      .mockResolvedValue({ allowed: true, isOwner: false }),
    getActiveHouseholdId: jest.fn().mockResolvedValue(null),
    getActiveMemberUserIds: jest.fn().mockResolvedValue([]),
    buildPrivatePullFilter: jest.fn((userId: string) => ({
      userId,
      $or: [{ householdId: { $exists: false } }, { householdId: null }],
    })),
    buildSharedPullFilter: jest.fn((householdId: string) => ({ householdId })),
    isShareableEntityType: jest.fn().mockReturnValue(true),
  } as unknown as HouseholdAuthzService;

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
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    lwwService,
    householdAuthz,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (householdAuthz.resolveHouseholdId as jest.Mock).mockReturnValue(undefined);
    (householdAuthz.authorizeSyncChange as jest.Mock).mockResolvedValue({
      allowed: true,
      isOwner: false,
    });
    (householdAuthz.buildEntityFilter as jest.Mock).mockImplementation(
      (userId: string, change: { entityId: string }) => ({
        userId,
        id: change.entityId,
        householdId: { $exists: false },
      }),
    );
  });

  it('returns noop for duplicate push without mutating or bumping version', async () => {
    findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        id: WALLET_ID,
        updatedAtMillis: 1000,
        deviceId: 'device-a',
      }),
    });
    (lwwService.decide as jest.Mock).mockReturnValue({
      outcome: 'noop',
      reason: 'ALREADY_APPLIED',
    });

    const result = await service.push('user-1', {
      changes: [
        {
          entityType: 'wallets',
          entityId: WALLET_ID,
          updatedAtMillis: 1000,
          deviceId: 'device-a',
          payload: { name: 'Cash' },
        },
      ],
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
      changes: [
        {
          entityType: 'wallets',
          entityId: WALLET_ID,
          updatedAtMillis: 1000,
          payload: {
            name: 'Cash',
            createdAtMillis: 900,
          },
        },
      ],
    });

    expect(result.accepted).toEqual([WALLET_ID]);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user-1', id: WALLET_ID, householdId: { $exists: false } },
      expect.objectContaining({
        $set: expect.not.objectContaining({
          createdAtMillis: expect.anything(),
        }),
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
      changes: [
        {
          entityType: 'wallets',
          entityId: WALLET_ID,
          updatedAtMillis: 1000,
          payload: {
            name: 'Cash',
            $gt: '',
            'nested.bad': 1,
            meta: { $where: 'true', ok: true },
          },
        },
      ],
    });

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user-1', id: WALLET_ID, householdId: { $exists: false } },
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

  it('rejects shared entity push when user is not a household member', async () => {
    (householdAuthz.resolveHouseholdId as jest.Mock).mockReturnValue(
      HOUSEHOLD_ID,
    );
    (householdAuthz.authorizeSyncChange as jest.Mock).mockResolvedValue({
      allowed: false,
      reason: 'NOT_HOUSEHOLD_MEMBER',
    });

    const result = await service.push('user-1', {
      changes: [
        {
          entityType: 'wallets',
          entityId: WALLET_ID,
          updatedAtMillis: 1000,
          payload: { name: 'Shared', householdId: HOUSEHOLD_ID },
        },
      ],
    });

    expect(result.rejected).toEqual([
      { entityId: WALLET_ID, reason: 'NOT_HOUSEHOLD_MEMBER' },
    ]);
    expect(findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('fans out serverVersion bump to all household members on shared mutation', async () => {
    (householdAuthz.resolveHouseholdId as jest.Mock).mockReturnValue(
      HOUSEHOLD_ID,
    );
    (householdAuthz.authorizeSyncChange as jest.Mock).mockResolvedValue({
      allowed: true,
      householdId: HOUSEHOLD_ID,
      isOwner: true,
    });
    (householdAuthz.buildEntityFilter as jest.Mock).mockImplementation(
      (_userId: string, change: { entityId: string }) => ({
        householdId: HOUSEHOLD_ID,
        id: change.entityId,
      }),
    );
    (householdAuthz.getActiveMemberUserIds as jest.Mock).mockResolvedValue([
      'user-1',
      'user-2',
    ]);
    findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    (lwwService.decide as jest.Mock).mockReturnValue({ outcome: 'accept' });
    findOneAndUpdate.mockResolvedValue({});

    await service.push('user-1', {
      changes: [
        {
          entityType: 'wallets',
          entityId: WALLET_ID,
          updatedAtMillis: 1000,
          payload: { name: 'Family Wallet', householdId: HOUSEHOLD_ID },
        },
      ],
    });

    expect(lwwService.bumpServerVersionForUsers).toHaveBeenCalledWith([
      'user-1',
      'user-2',
    ]);
    expect(lwwService.bumpServerVersion).not.toHaveBeenCalled();
  });
});

describe('SyncService pull with household', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();
  const find = jest.fn();
  const model = { findOne, findOneAndUpdate, find };

  const lwwService = {
    decide: jest.fn(),
    bumpServerVersion: jest.fn(),
    bumpServerVersionForUsers: jest.fn(),
    getServerVersion: jest.fn().mockResolvedValue('5'),
  } as unknown as LwwService;

  const householdAuthz = {
    resolveHouseholdId: jest.fn(),
    buildEntityFilter: jest.fn(),
    authorizeSyncChange: jest.fn(),
    getActiveHouseholdId: jest.fn().mockResolvedValue(HOUSEHOLD_ID),
    getActiveMemberUserIds: jest.fn(),
    buildPrivatePullFilter: jest.fn((userId: string) => ({
      userId,
      $or: [{ householdId: { $exists: false } }, { householdId: null }],
    })),
    buildSharedPullFilter: jest.fn((householdId: string) => ({ householdId })),
    isShareableEntityType: jest.fn().mockReturnValue(true),
  } as unknown as HouseholdAuthzService;

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
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    lwwService,
    householdAuthz,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (lwwService.getServerVersion as jest.Mock).mockResolvedValue('5');
    find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });
  });

  it('pulls private and shared entities when user belongs to a household', async () => {
    const walletFind = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest
          .fn()
          .mockResolvedValueOnce([
            { id: 'private-wallet', updatedAtMillis: 1, userId: 'user-1' },
          ])
          .mockResolvedValueOnce([
            {
              id: 'shared-wallet',
              updatedAtMillis: 2,
              userId: 'owner',
              householdId: HOUSEHOLD_ID,
            },
          ]),
      }),
    });

    const emptyFind = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
    });

    const serviceWithWallets = new SyncService(
      model as never,
      { find: walletFind } as never,
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
      model as never,
      model as never,
      model as never,
      lwwService,
      householdAuthz,
    );

    const result = await serviceWithWallets.pull('user-1');

    expect(householdAuthz.getActiveHouseholdId).toHaveBeenCalledWith('user-1');
    expect(
      result.entities.filter((e) => e.entityType === 'wallets'),
    ).toHaveLength(2);
  });
});
