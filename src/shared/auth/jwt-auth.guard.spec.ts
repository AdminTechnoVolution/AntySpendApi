import { ForbiddenException } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { JwtAuthGuard, SkipSubscriptionCheck } from './jwt-auth.guard';

describe('JwtAuthGuard subscription-write check', () => {
  const getMyEntitlement = jest.fn();
  const entitlementsService = { getMyEntitlement };

  let guard: JwtAuthGuard;

  const buildContext = (
    method: string,
    handlerMetadata: Record<string, unknown> = {},
  ) => {
    const request: { method: string; user: { userId: string } } = {
      method,
      user: { userId: 'user-1' },
    };
    const handler = () => undefined;
    const reflector = new Reflector();
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockImplementation((key: string) => handlerMetadata[key]);

    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => class Controller {},
    } as never;

    return { context, reflector };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const buildGuard = (reflector: Reflector) => {
    const moduleRef = {
      get: () => entitlementsService,
    } as unknown as ModuleRef;
    const g = new JwtAuthGuard(reflector, moduleRef);
    // Bypass the real passport authentication step; we only test the
    // subscription-gating logic that runs after authentication succeeds.
    const passportGuardPrototype = Object.getPrototypeOf(
      Object.getPrototypeOf(g),
    ) as { canActivate: (context: unknown) => Promise<boolean> };
    jest.spyOn(passportGuardPrototype, 'canActivate').mockResolvedValue(true);
    return g;
  };

  it('allows a non-premium user to PATCH a route marked @SkipSubscriptionCheck (e.g. auth/profile)', async () => {
    const { context, reflector } = buildContext('PATCH', {
      skipSubscriptionCheck: true,
    });
    guard = buildGuard(reflector);
    getMyEntitlement.mockResolvedValue({ premiumAccessActive: false });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(getMyEntitlement).not.toHaveBeenCalled();
  });

  it('still blocks a non-premium user from mutating a route without the skip decorator', async () => {
    const { context, reflector } = buildContext('PATCH', {});
    guard = buildGuard(reflector);
    getMyEntitlement.mockResolvedValue({ premiumAccessActive: false });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(guard.canActivate(context)).rejects.toThrow(
      'SUBSCRIPTION_REQUIRED_FOR_WRITE',
    );
  });

  it('allows a premium user to mutate a route without the skip decorator', async () => {
    const { context, reflector } = buildContext('PATCH', {});
    guard = buildGuard(reflector);
    getMyEntitlement.mockResolvedValue({ premiumAccessActive: true });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('allows GET requests without checking entitlements at all', async () => {
    const { context, reflector } = buildContext('GET', {});
    guard = buildGuard(reflector);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(getMyEntitlement).not.toHaveBeenCalled();
  });

  it('exposes SkipSubscriptionCheck as a usable decorator', () => {
    expect(typeof SkipSubscriptionCheck).toBe('function');
  });
});
