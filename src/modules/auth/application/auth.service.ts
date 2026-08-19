import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import { GoogleTokenVerifier } from '../../../shared/auth/google-token.verifier';
import { AntyJwtPayload } from '../../../shared/auth/jwt-payload.interface';
import {
  RefreshToken,
  RefreshTokenDocument,
  User,
  UserDocument,
} from '../infrastructure/user.schema';
import { SettingsService } from '../../settings/application/settings.service';

const REFRESH_IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000;
const MAX_DISPLAY_NAME_LENGTH = 50;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly googleVerifier: GoogleTokenVerifier,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  async loginWithGoogle(idToken: string) {
    const profile = await this.googleVerifier.verifyIdToken(idToken);
    const now = Date.now();

    const existingUser = await this.userModel
      .findOne({ googleSub: profile.googleSub })
      .lean();
    let preserveCustomName = false;
    if (existingUser) {
      const settings = await this.settingsService.findByUserId(
        existingUser._id.toString(),
      );
      preserveCustomName = settings?.displayNameUserEdited === true;
    }

    const setFields: Record<string, unknown> = {
      email: profile.email,
      picture: profile.picture,
      updatedAtMillis: now,
    };
    if (!preserveCustomName) {
      setFields.name = profile.name;
    }

    const user = await this.userModel.findOneAndUpdate(
      { googleSub: profile.googleSub },
      {
        $set: setFields,
        $setOnInsert: {
          googleSub: profile.googleSub,
          createdAtMillis: now,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    await this.settingsService.ensureForUser(user._id.toString(), profile);

    const userId = user._id.toString();
    return this.issueTokens(userId, user.email, {
      id: userId,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
  }

  async refresh(refreshToken: string) {
    let payload: AntyJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<AntyJwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const hash = this.hashToken(refreshToken);
    const now = Date.now();

    const existing = await this.refreshTokenModel.findOne({
      tokenHash: hash,
    });
    if (!existing) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    if (!existing.revoked) {
      if (existing.expiresAt <= new Date()) {
        throw new UnauthorizedException('Refresh token expired or revoked');
      }

      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.issueTokens(user._id.toString(), user.email, {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        picture: user.picture,
      });

      // Revoke and cache the rotation result in one atomic write, so a concurrent caller
      // that loses this race can never observe "revoked" without a usable rotationResult.
      const updated = await this.refreshTokenModel.findOneAndUpdate(
        { tokenHash: hash, revoked: false },
        {
          $set: {
            revoked: true,
            rotationResult: {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              issuedAtMillis: now,
            },
          },
        },
        { returnDocument: 'after' },
      );
      if (updated) {
        return tokens;
      }
      // Lost the race between our read and this write — fall through to the shared
      // rotationResult below, which the winner is guaranteed to have written atomically.
    }

    const revoked = await this.refreshTokenModel.findOne({
      tokenHash: hash,
      revoked: true,
    });
    const cached = revoked?.rotationResult;
    if (
      cached &&
      now - cached.issuedAtMillis <= REFRESH_IDEMPOTENCY_WINDOW_MS
    ) {
      const user = await this.userModel.findById(payload.sub).lean();
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return {
        accessToken: cached.accessToken,
        refreshToken: cached.refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      };
    }
    throw new UnauthorizedException('Refresh token expired or revoked');
  }

  async logout(refreshToken: string) {
    const hash = this.hashToken(refreshToken);
    await this.refreshTokenModel.updateOne(
      { tokenHash: hash },
      { $set: { revoked: true } },
    );
    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      picture: user.picture,
      createdAtMillis: user.createdAtMillis,
      updatedAtMillis: user.updatedAtMillis,
    };
  }

  async updateProfile(userId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('Name cannot be empty');
    }
    if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
      throw new BadRequestException('Name is too long');
    }

    const now = Date.now();
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { name: trimmed, updatedAtMillis: now } },
        { returnDocument: 'after' },
      )
      .lean();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.settingsService.update(userId, {
      googleUserName: trimmed,
      displayNameUserEdited: true,
    });

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      picture: user.picture,
      createdAtMillis: user.createdAtMillis,
      updatedAtMillis: user.updatedAtMillis,
    };
  }

  private async issueTokens(
    userId: string,
    email: string,
    user: { id: string; email: string; name: string; picture?: string },
  ) {
    const accessPayload: AntyJwtPayload = {
      sub: userId,
      email,
      type: 'access',
    };
    const refreshPayload: AntyJwtPayload = {
      sub: userId,
      email,
      type: 'refresh',
    };

    const accessExpires =
      this.config.get<string>('jwt.accessExpires') ?? '15m';
    const refreshExpires =
      this.config.get<string>('jwt.refreshExpires') ?? '7d';

    const accessToken = await this.jwtService.signAsync(
      { ...accessPayload },
      { expiresIn: accessExpires as `${number}${'s' | 'm' | 'h' | 'd'}` },
    );
    const refreshToken = await this.jwtService.signAsync(
      { ...refreshPayload },
      { expiresIn: refreshExpires as `${number}${'s' | 'm' | 'h' | 'd'}` },
    );

    const expiresMs = this.parseExpiry(refreshExpires);
    await this.refreshTokenModel.create({
      userId,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + expiresMs),
      revoked: false,
    });

    return { accessToken, refreshToken, user };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const amount = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return amount * (multipliers[unit] ?? multipliers.d);
  }
}

export function generateId(): string {
  return randomBytes(16).toString('hex');
}
