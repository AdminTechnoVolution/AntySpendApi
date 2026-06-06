import { LwwService, decideLww } from './lww.service';
import { SyncChange } from './sync.types';

describe('LwwService', () => {
  const mockModel = {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
  };

  const service = new LwwService(mockModel as never);

  const baseChange: SyncChange = {
    entityType: 'wallets',
    entityId: 'abc',
    updatedAtMillis: 1000,
    payload: {},
  };

  it('accepts when no server record exists', () => {
    expect(service.decide(baseChange, undefined, undefined).outcome).toBe(
      'accept',
    );
  });

  it('accepts when client is newer', () => {
    expect(service.decide(baseChange, 500, 'device-a').outcome).toBe('accept');
  });

  it('rejects when server is newer', () => {
    const result = service.decide(baseChange, 2000, 'device-a');
    expect(result.outcome).toBe('reject');
    expect(result.reason).toBe('SERVER_NEWER');
  });

  it('uses deviceId lexicographic tie-break', () => {
    const tie = { ...baseChange, deviceId: 'device-z' };
    expect(service.decide(tie, 1000, 'device-a').outcome).toBe('accept');
    expect(service.decide(baseChange, 1000, 'device-z').outcome).toBe(
      'reject',
    );
  });

  it('returns noop for duplicate push of same version and device', () => {
    const replay = { ...baseChange, deviceId: 'device-a' };
    const result = decideLww(replay, 1000, 'device-a');
    expect(result.outcome).toBe('noop');
    expect(result.reason).toBe('ALREADY_APPLIED');
  });
});

describe('decideLww', () => {
  it('treats missing device ids as equal for noop', () => {
    const result = decideLww({ updatedAtMillis: 1000 }, 1000, undefined);
    expect(result.outcome).toBe('noop');
  });
});
