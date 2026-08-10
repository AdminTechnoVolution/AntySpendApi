import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AiUsageQuotaGuard, RequestWithAiUsageQuota } from './ai-usage-quota.guard';
import { EntitlementsService } from '../../modules/households/application/entitlements.service';

describe('AiUsageQuotaGuard', () => {
  const getMyEntitlement = jest.fn();
  const getOrResetMonthlyAiUsage = jest.fn();
  const entitlementsService = {
    getMyEntitlement,
    getOrResetMonthlyAiUsage,
  } as unknown as EntitlementsService;

  let guard: AiUsageQuotaGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new AiUsageQuotaGuard(entitlementsService);
  });

  function contextWith(request: Partial<RequestWithAiUsageQuota>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('allows the request through without touching the counter when premium is active', async () => {
    getMyEntitlement.mockResolvedValue({ premiumAccessActive: true });
    const request: Partial<RequestWithAiUsageQuota> = { user: { userId: 'u1' } };

    const allowed = await guard.canActivate(contextWith(request));

    expect(allowed).toBe(true);
    expect(getOrResetMonthlyAiUsage).not.toHaveBeenCalled();
    expect(request.aiUsageQuota).toBeUndefined();
  });

  it('allows a free user under quota and reserves the monthKey on the request', async () => {
    getMyEntitlement.mockResolvedValue({ premiumAccessActive: false });
    getOrResetMonthlyAiUsage.mockResolvedValue({ count: 3, monthKey: '2026-08' });
    const request: Partial<RequestWithAiUsageQuota> = { user: { userId: 'u1' } };

    const allowed = await guard.canActivate(contextWith(request));

    expect(allowed).toBe(true);
    expect(request.aiUsageQuota).toEqual({ monthKey: '2026-08' });
  });

  it('blocks with a distinctly-coded 403 once the free quota is exhausted', async () => {
    getMyEntitlement.mockResolvedValue({ premiumAccessActive: false });
    getOrResetMonthlyAiUsage.mockResolvedValue({ count: 5, monthKey: '2026-08' });
    const request: Partial<RequestWithAiUsageQuota> = { user: { userId: 'u1' } };

    let thrown: ForbiddenException | undefined;
    try {
      await guard.canActivate(contextWith(request));
    } catch (error) {
      thrown = error as ForbiddenException;
    }

    expect(thrown).toBeInstanceOf(ForbiddenException);
    expect(thrown?.getResponse()).toMatchObject({
      code: 'AI_FREE_QUOTA_EXCEEDED',
      used: 5,
      limit: 5,
    });
  });

  it('passes through unauthenticated requests (JwtAuthGuard already ran first)', async () => {
    const request: Partial<RequestWithAiUsageQuota> = {};

    const allowed = await guard.canActivate(contextWith(request));

    expect(allowed).toBe(true);
    expect(getMyEntitlement).not.toHaveBeenCalled();
  });
});

describe('AiUsageQuotaGuard error shape', () => {
  it('ForbiddenException.getResponse() returns the raw object passed in (spread by AllExceptionsFilter)', () => {
    const error = new ForbiddenException({ code: 'AI_FREE_QUOTA_EXCEEDED', used: 5, limit: 5 });
    expect(error.getResponse()).toEqual({ code: 'AI_FREE_QUOTA_EXCEEDED', used: 5, limit: 5 });
  });
});
