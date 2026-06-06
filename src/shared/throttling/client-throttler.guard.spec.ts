import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import type { Request } from 'express';
import { ClientThrottlerGuard } from './client-throttler.guard';
import { resolveClientIp } from './resolve-client-ip';

describe('resolveClientIp', () => {
  it('uses first x-forwarded-for hop when present', () => {
    const request = {
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
      ip: '127.0.0.1',
    } as Request;

    expect(resolveClientIp(request)).toBe('203.0.113.1');
  });

  it('falls back to request.ip', () => {
    const request = { headers: {}, ip: '192.0.2.10' } as Request;
    expect(resolveClientIp(request)).toBe('192.0.2.10');
  });
});

describe('ClientThrottlerGuard', () => {
  const reflector = {} as Reflector;
  const storage = {
    increment: jest.fn(),
  } as unknown as ThrottlerStorage;
  const options = {
    throttlers: [{ ttl: 60_000, limit: 50 }],
  } as ThrottlerModuleOptions;

  const jwtService = {
    verifyAsync: jest.fn(),
  } as unknown as JwtService;

  const guard = new ClientThrottlerGuard(
    options,
    storage,
    reflector,
    jwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks authenticated users by userId', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 'user-abc',
      type: 'access',
    });

    const request = {
      headers: { authorization: 'Bearer valid-token' },
      ip: '192.0.2.1',
    } as Request;

    await expect(guard['getTracker'](request)).resolves.toBe('user:user-abc');
  });

  it('tracks unauthenticated clients by IP', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('bad token'));

    const request = {
      headers: { authorization: 'Bearer invalid' },
      ip: '192.0.2.2',
    } as Request;

    await expect(guard['getTracker'](request)).resolves.toBe('ip:192.0.2.2');
  });

  it('skips throttling for docs routes', async () => {
    const canActivateSpy = jest
      .spyOn(Object.getPrototypeOf(ClientThrottlerGuard.prototype), 'canActivate')
      .mockResolvedValue(true);

    const request = { path: '/docs', url: '/docs' } as Request;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(canActivateSpy).not.toHaveBeenCalled();
    canActivateSpy.mockRestore();
  });
});
