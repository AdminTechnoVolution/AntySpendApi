import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { EntitlementsService } from '../../modules/households/application/entitlements.service';

export const PUBLIC_ROUTE_KEY = 'publicRoute';
export const SKIP_SUBSCRIPTION_CHECK_KEY = 'skipSubscriptionCheck';

export const PublicRoute = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
export const SkipSubscriptionCheck = () =>
  SetMetadata(SKIP_SUBSCRIPTION_CHECK_KEY, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context) || this.isDocsRoute(context)) {
      return true;
    }

    const authenticated = (await super.canActivate(context)) as boolean;
    if (!authenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request & {
      user?: { userId: string };
    }>();

    if (!this.isMutatingRequest(request) || this.skipSubscriptionCheck(context)) {
      return true;
    }

    const entitlementsService = this.moduleRef.get(EntitlementsService, { strict: false });
    if (!entitlementsService) {
      return true;
    }

    const entitlement = await entitlementsService.getMyEntitlement(request.user?.userId ?? '');
    if (entitlement.premiumAccessActive) {
      return true;
    }

    throw new ForbiddenException('SUBSCRIPTION_REQUIRED_FOR_WRITE');
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false
    );
  }

  private skipSubscriptionCheck(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean>(SKIP_SUBSCRIPTION_CHECK_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false
    );
  }

  private isDocsRoute(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const url = request.originalUrl ?? request.url ?? '';
    return (
      url.startsWith('/docs') ||
      url.startsWith('/docs-json') ||
      url.startsWith('/openapi.json')
    );
  }

  private isMutatingRequest(request: Request): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  }
}
