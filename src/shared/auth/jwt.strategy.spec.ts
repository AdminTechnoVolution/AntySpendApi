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

  it('accepts an access token without a session id for an existing user', async () => {
    lean.mockResolvedValue({ _id: 'u1' });
    const result = await strategy.validate({
      sub: 'u1',
      email: 'a@b.com',
      type: 'access',
    });
    expect(result).toEqual({ userId: 'u1', email: 'a@b.com' });
  });

  it('accepts an access token with a session id for an existing user', async () => {
    lean.mockResolvedValue({ _id: 'u1' });
    const result = await strategy.validate({
      sub: 'u1',
      email: 'a@b.com',
      type: 'access',
      sessionId: 'session-1',
    });
    expect(result).toEqual({ userId: 'u1', email: 'a@b.com' });
  });

  it('keeps an access token valid after a login elsewhere', async () => {
    lean.mockResolvedValue({ _id: 'u1' });
    const result = await strategy.validate({
      sub: 'u1',
      email: 'a@b.com',
      type: 'access',
      sessionId: 'session-1',
    });
    expect(result).toEqual({ userId: 'u1', email: 'a@b.com' });
  });
});
