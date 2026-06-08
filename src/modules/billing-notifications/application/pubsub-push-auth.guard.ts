import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import type { Request } from 'express';

@Injectable()
export class PubSubPushAuthGuard implements CanActivate {
  private readonly logger = new Logger(PubSubPushAuthGuard.name);
  private readonly oauthClient = new OAuth2Client();

  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.shouldSkipAuth()) {
      this.logger.warn(
        'Pub/Sub push auth skipped (RTDN_SKIP_AUTH, RTDN_ENABLED=false, or missing audience in dev)',
      );
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('PUBSUB_PUSH_AUTH_MISSING');
    }

    const token = authHeader.slice('Bearer '.length);
    const audience = this.config.get<string>('rtdn.pubsubPushAudience');
    const expectedEmail = this.config.get<string>(
      'rtdn.pubsubPushServiceAccountEmail',
    );

    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: token,
        audience,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new UnauthorizedException('PUBSUB_PUSH_AUTH_INVALID');
      }
      if (expectedEmail && payload.email !== expectedEmail) {
        throw new UnauthorizedException('PUBSUB_PUSH_AUTH_EMAIL_MISMATCH');
      }
      if (payload.email_verified === false) {
        throw new UnauthorizedException('PUBSUB_PUSH_AUTH_EMAIL_UNVERIFIED');
      }
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.warn('Pub/Sub push JWT verification failed', error);
      throw new UnauthorizedException('PUBSUB_PUSH_AUTH_INVALID');
    }
  }

  private shouldSkipAuth(): boolean {
    if (this.config.get<boolean>('rtdn.skipAuth')) {
      return true;
    }
    if (!this.config.get<boolean>('rtdn.enabled')) {
      return true;
    }
    const audience = this.config.get<string>('rtdn.pubsubPushAudience');
    if (!audience) {
      const nodeEnv = this.config.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
      return nodeEnv === 'development' || nodeEnv === 'test';
    }
    return false;
  }
}
