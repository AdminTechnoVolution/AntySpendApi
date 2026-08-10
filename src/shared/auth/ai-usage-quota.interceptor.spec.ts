import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError, firstValueFrom } from 'rxjs';
import { AiUsageQuotaInterceptor } from './ai-usage-quota.interceptor';
import { RequestWithAiUsageQuota } from './ai-usage-quota.guard';
import { EntitlementsService } from '../../modules/households/application/entitlements.service';

describe('AiUsageQuotaInterceptor', () => {
  const recordFreeAiUsage = jest.fn();
  const entitlementsService = { recordFreeAiUsage } as unknown as EntitlementsService;
  let interceptor: AiUsageQuotaInterceptor;

  beforeEach(() => {
    jest.clearAllMocks();
    recordFreeAiUsage.mockResolvedValue(undefined);
    interceptor = new AiUsageQuotaInterceptor(entitlementsService);
  });

  function contextWith(request: Partial<RequestWithAiUsageQuota>): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  it('records a free use after the handler succeeds', async () => {
    const request: Partial<RequestWithAiUsageQuota> = {
      user: { userId: 'u1' },
      aiUsageQuota: { monthKey: '2026-08' },
    };
    const handler: CallHandler = { handle: () => of({ ok: true }) };

    await firstValueFrom(interceptor.intercept(contextWith(request), handler));

    expect(recordFreeAiUsage).toHaveBeenCalledWith('u1', '2026-08');
  });

  it('does NOT record a use when the handler throws (failed AI call is free)', async () => {
    const request: Partial<RequestWithAiUsageQuota> = {
      user: { userId: 'u1' },
      aiUsageQuota: { monthKey: '2026-08' },
    };
    const handler: CallHandler = {
      handle: () => throwError(() => new Error('OpenRouter failed')),
    };

    await expect(
      firstValueFrom(interceptor.intercept(contextWith(request), handler)),
    ).rejects.toThrow('OpenRouter failed');
    expect(recordFreeAiUsage).not.toHaveBeenCalled();
  });

  it('does nothing when the guard never reserved a quota (premium user)', async () => {
    const request: Partial<RequestWithAiUsageQuota> = { user: { userId: 'u1' } };
    const handler: CallHandler = { handle: () => of({ ok: true }) };

    await firstValueFrom(interceptor.intercept(contextWith(request), handler));

    expect(recordFreeAiUsage).not.toHaveBeenCalled();
  });
});
