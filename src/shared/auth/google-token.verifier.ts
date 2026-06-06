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
  private readonly client: OAuth2Client;

  constructor(private readonly config: ConfigService) {
    this.client = new OAuth2Client(config.getOrThrow<string>('google.clientId'));
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.config.getOrThrow<string>('google.clientId'),
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
