import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { EntitlementsService } from '../../modules/households/application/entitlements.service';
import { AI_FREE_MONTHLY_QUOTA, startOfNextUtcMonthMillis } from '../billing/ai-quota.util';

export interface RequestWithAiUsageQuota extends Request {
  user?: { userId: string };
  aiUsageQuota?: { monthKey: string };
}

/**
 * Gates the AI endpoints for users without an active subscription: allows up to
 * AI_FREE_MONTHLY_QUOTA free uses per calendar month (shared across all AI routes), then blocks
 * with a distinctly-coded 403 so clients can show "upgrade" messaging instead of a generic error.
 * Premium users (premiumAccessActive) always pass through without touching the counter.
 *
 * Only CHECKS the quota — it does not increment it. Actually recording a use happens in
 * AiUsageQuotaInterceptor, only after the request succeeds, so a failed AI call never costs the
 * user their free use.
 */
@Injectable()
export class AiUsageQuotaGuard implements CanActivate {
  constructor(private readonly entitlementsService: EntitlementsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAiUsageQuota>();
    const userId = request.user?.userId;
    if (!userId) return true;

    const entitlement = await this.entitlementsService.getMyEntitlement(userId);
    if (entitlement.premiumAccessActive) return true;

    const usage = await this.entitlementsService.getOrResetMonthlyAiUsage(userId);
    if (usage.count >= AI_FREE_MONTHLY_QUOTA) {
      throw new ForbiddenException({
        code: 'AI_FREE_QUOTA_EXCEEDED',
        message: 'Free AI usage limit reached for this month.',
        used: usage.count,
        limit: AI_FREE_MONTHLY_QUOTA,
        resetsAtMillis: startOfNextUtcMonthMillis(),
      });
    }

    request.aiUsageQuota = { monthKey: usage.monthKey };
    return true;
  }
}
