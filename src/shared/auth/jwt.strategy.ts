import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserDocument } from '../../modules/auth/infrastructure/user.schema';
import { AntyJwtPayload, AuthenticatedUser } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: AntyJwtPayload): Promise<AuthenticatedUser> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.userModel
      .findById(payload.sub)
      .select('activeSessionId')
      .lean();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // No activeSessionId yet (user hasn't logged in again since this was added) means "no
    // session check" — so already-logged-in users aren't kicked out the moment this deploys.
    // Once any login sets it, every other token (including older ones with no sessionId at
    // all) stops matching and is rejected here on its next use.
    if (user.activeSessionId && user.activeSessionId !== payload.sessionId) {
      throw new UnauthorizedException(
        'Session was signed out from another device',
      );
    }
    return { userId: payload.sub, email: payload.email };
  }
}
