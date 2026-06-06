import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import type { AntyJwtPayload } from '../auth/jwt-payload.interface';
import { resolveClientIp } from './resolve-client-ip';

@Injectable()
export class ClientThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ConstructorParameters<typeof ThrottlerGuard>[0],
    storageService: ConstructorParameters<typeof ThrottlerGuard>[1],
    reflector: ConstructorParameters<typeof ThrottlerGuard>[2],
    private readonly jwtService: JwtService,
  ) {
    super(options, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path ?? request.url?.split('?')[0] ?? '';
    if (path.startsWith('/docs') || path === '/openapi.json') {
      return true;
    }
    return super.canActivate(context);
  }

  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as unknown as Request;
    const authHeader = request.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length);
      try {
        const payload = await this.jwtService.verifyAsync<AntyJwtPayload>(token);
        if (payload.type === 'access' && payload.sub) {
          return `user:${payload.sub}`;
        }
      } catch {
        // Invalid or expired token — rate limit by IP instead.
      }
    }
    return `ip:${resolveClientIp(request)}`;
  }
}
