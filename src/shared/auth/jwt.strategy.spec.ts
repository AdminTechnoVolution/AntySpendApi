import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const findById = jest.fn();
  const select = jest.fn();
  const lean = jest.fn();
  const userModel = { findById };

  const config = {
    getOrThrow: jest.fn().mockReturnValue('secret'),
  } as unknown as ConfigService;

  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    findById.mockReturnValue({ select });
    select.mockReturnValue({ lean });
    strategy = new JwtStrategy(config, userModel as never);
  });

  it('rejects a non-access token', async () => {
    await expect(
      strategy.validate({ sub: 'u1', email: 'a@b.com', type: 'refresh' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects when the user no longer exists', async () => {
    lean.mockResolvedValue(null);
    await expect(
      strategy.validate({ sub: 'u1', email: 'a@b.com', type: 'access' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a token with no sessionId when the user has never started a tracked session', async () => {
    lean.mockResolvedValue({ activeSessionId: undefined });
    const result = await strategy.validate({
      sub: 'u1',
      email: 'a@b.com',
      type: 'access',
    });
    expect(result).toEqual({ userId: 'u1', email: 'a@b.com' });
  });

  it('accepts a token whose sessionId matches the user active session', async () => {
    lean.mockResolvedValue({ activeSessionId: 'session-1' });
    const result = await strategy.validate({
      sub: 'u1',
      email: 'a@b.com',
      type: 'access',
      sessionId: 'session-1',
    });
    expect(result).toEqual({ userId: 'u1', email: 'a@b.com' });
  });

  it('rejects a token superseded by a newer login elsewhere', async () => {
    lean.mockResolvedValue({ activeSessionId: 'session-2' });
    await expect(
      strategy.validate({
        sub: 'u1',
        email: 'a@b.com',
        type: 'access',
        sessionId: 'session-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
