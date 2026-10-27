import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { MascotPremiumGuard } from './mascot-premium.guard';

describe('MascotPremiumGuard', () => {
  const context = (userId?: string) => ({
    switchToHttp: () => ({ getRequest: () => ({ user: userId ? { userId } : undefined }) }),
  }) as ExecutionContext;

  it('allows an active subscriber and a Family beneficiary resolved as premium access', async () => {
    const entitlements = { getMyEntitlement: jest.fn().mockResolvedValue({ premiumAccessActive: true }) };
    const guard = new MascotPremiumGuard(entitlements as never);

    await expect(guard.canActivate(context('subscriber'))).resolves.toBe(true);
    expect(entitlements.getMyEntitlement).toHaveBeenCalledWith('subscriber');
  });

  it('rejects a user without premium access', async () => {
    const guard = new MascotPremiumGuard({ getMyEntitlement: jest.fn().mockResolvedValue({ premiumAccessActive: false }) } as never);

    await expect(guard.canActivate(context('free-user'))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects missing authenticated identity', async () => {
    const guard = new MascotPremiumGuard({ getMyEntitlement: jest.fn() } as never);

    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(ForbiddenException);
  });
});
