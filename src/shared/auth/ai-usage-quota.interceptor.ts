import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { EntitlementsService } from '../../modules/households/application/entitlements.service';
import type { RequestWithAiUsageQuota } from './ai-usage-quota.guard';

/**
 * Records one free AI use, but only once the request succeeds — pairs with AiUsageQuotaGuard,
 * which reserves the request.aiUsageQuota context but does not increment. If the handler throws
 * (network/model failure, invalid response, etc.), tap's success callback never runs, so a failed
 * AI call never costs the user their free use.
 */
@Injectable()
export class AiUsageQuotaInterceptor implements NestInterceptor {
  constructor(private readonly entitlementsService: EntitlementsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithAiUsageQuota>();
    const quota = request.aiUsageQuota;
    const userId = request.user?.userId;

    return next.handle().pipe(
      tap(() => {
        if (quota && userId) {
          this.entitlementsService
            .recordFreeAiUsage(userId, quota.monthKey)
            .catch(() => undefined);
        }
      }),
    );
  }
}
