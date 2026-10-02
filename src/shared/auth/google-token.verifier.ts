import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

export interface GoogleProfile {
  googleSub: string;
  email: string;
  name: string;
  picture?: string;
}

@Injectable()
export class GoogleTokenVerifier {
  private readonly client = new OAuth2Client();

  constructor(private readonly config: ConfigService) {}

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    // Comma-separated, same convention as APPLE_CLIENT_ID — one API instance validates
    // Android (Web Client ID) and every iOS build's own Client ID as equally valid audiences.
    const configuredAudience = this.config.get<string>('google.clientId');
    const audience = configuredAudience
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (!audience?.length) {
      throw new UnauthorizedException('Google Sign In is not configured');
    }
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience,
      });
      const payload: TokenPayload | undefined = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        throw new UnauthorizedException('Invalid Google token payload');
      }
      return {
        googleSub: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email,
        picture: payload.picture,
      };
    } catch {
      throw new UnauthorizedException('Invalid Google idToken');
    }
  }
}
