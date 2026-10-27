import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { EntitlementsService } from '../../households/application/entitlements.service';

@Injectable()
export class MascotPremiumGuard implements CanActivate {
  constructor(private readonly entitlements: EntitlementsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: { userId?: string } }>();
    const userId = request.user?.userId;
    if (!userId) throw new ForbiddenException('AUTHENTICATION_REQUIRED');
    const entitlement = await this.entitlements.getMyEntitlement(userId);
    if (!entitlement.premiumAccessActive) {
      throw new ForbiddenException('MASCOT_SUBSCRIPTION_REQUIRED');
    }
    return true;
  }
}
