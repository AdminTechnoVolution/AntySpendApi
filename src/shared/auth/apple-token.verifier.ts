import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AppleProfile {
  appleSub: string;
  email?: string;
}

@Injectable()
export class AppleTokenVerifier {
  constructor(private readonly config: ConfigService) {}

  async verifyIdentityToken(
    identityToken: string,
    nonce: string,
  ): Promise<AppleProfile> {
    const configuredAudience = this.config.get<string>('apple.clientId');
    const audience = configuredAudience
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (!audience?.length) {
      throw new UnauthorizedException('Apple Sign In is not configured');
    }

    try {
      const { createRemoteJWKSet, jwtVerify } = await import('jose');
      const keys = createRemoteJWKSet(
        new URL('https://appleid.apple.com/auth/keys'),
      );
      const { payload } = await jwtVerify(identityToken, keys, {
        issuer: 'https://appleid.apple.com',
        audience,
      });
      if (
        typeof payload.sub !== 'string' ||
        !payload.sub ||
        payload.nonce !== nonce
      ) {
        throw new UnauthorizedException('Invalid Apple token claims');
      }
      return {
        appleSub: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
      };
    } catch {
      throw new UnauthorizedException('Invalid Apple identityToken');
    }
  }
}