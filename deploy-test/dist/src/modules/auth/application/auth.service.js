"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
exports.generateId = generateId;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const google_token_verifier_1 = require("../../../shared/auth/google-token.verifier");
const user_schema_1 = require("../infrastructure/user.schema");
const settings_service_1 = require("../../settings/application/settings.service");
const REFRESH_IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000;
const MAX_DISPLAY_NAME_LENGTH = 50;
let AuthService = class AuthService {
    userModel;
    refreshTokenModel;
    googleVerifier;
    jwtService;
    config;
    settingsService;
    constructor(userModel, refreshTokenModel, googleVerifier, jwtService, config, settingsService) {
        this.userModel = userModel;
        this.refreshTokenModel = refreshTokenModel;
        this.googleVerifier = googleVerifier;
        this.jwtService = jwtService;
        this.config = config;
        this.settingsService = settingsService;
    }
    async loginWithGoogle(idToken) {
        const profile = await this.googleVerifier.verifyIdToken(idToken);
        const now = Date.now();
        const existingUser = await this.userModel
            .findOne({ googleSub: profile.googleSub })
            .lean();
        let preserveCustomName = false;
        if (existingUser) {
            const settings = await this.settingsService.findByUserId(existingUser._id.toString());
            preserveCustomName = settings?.displayNameUserEdited === true;
        }
        const setFields = {
            email: profile.email,
            picture: profile.picture,
            updatedAtMillis: now,
        };
        if (!preserveCustomName) {
            setFields.name = profile.name;
        }
        const user = await this.userModel.findOneAndUpdate({ googleSub: profile.googleSub }, {
            $set: setFields,
            $setOnInsert: {
                googleSub: profile.googleSub,
                createdAtMillis: now,
            },
        }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
        await this.settingsService.ensureForUser(user._id.toString(), profile);
        const userId = user._id.toString();
        return this.issueTokens(userId, user.email, {
            id: userId,
            email: user.email,
            name: user.name,
            picture: user.picture,
        });
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (payload.type !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        const hash = this.hashToken(refreshToken);
        const now = Date.now();
        const stored = await this.refreshTokenModel.findOneAndUpdate({
            tokenHash: hash,
            revoked: false,
        }, { $set: { revoked: true } }, { returnDocument: 'before' });
        if (!stored) {
            const revoked = await this.refreshTokenModel.findOne({
                tokenHash: hash,
                revoked: true,
            });
            const cached = revoked?.rotationResult;
            if (cached &&
                now - cached.issuedAtMillis <= REFRESH_IDEMPOTENCY_WINDOW_MS) {
                const user = await this.userModel.findById(payload.sub).lean();
                if (!user) {
                    throw new common_1.UnauthorizedException('User not found');
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
            throw new common_1.UnauthorizedException('Refresh token expired or revoked');
        }
        if (stored.expiresAt <= new Date()) {
            throw new common_1.UnauthorizedException('Refresh token expired or revoked');
        }
        const user = await this.userModel.findById(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const tokens = await this.issueTokens(user._id.toString(), user.email, {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            picture: user.picture,
        });
        await this.refreshTokenModel.updateOne({ tokenHash: hash }, {
            $set: {
                rotationResult: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    issuedAtMillis: now,
                },
            },
        });
        return tokens;
    }
    async logout(refreshToken) {
        const hash = this.hashToken(refreshToken);
        await this.refreshTokenModel.updateOne({ tokenHash: hash }, { $set: { revoked: true } });
        return { success: true };
    }
    async getMe(userId) {
        const user = await this.userModel.findById(userId).lean();
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
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
    async updateProfile(userId, name) {
        const trimmed = name.trim();
        if (!trimmed) {
            throw new common_1.BadRequestException('Name cannot be empty');
        }
        if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
            throw new common_1.BadRequestException('Name is too long');
        }
        const now = Date.now();
        const user = await this.userModel
            .findByIdAndUpdate(userId, { $set: { name: trimmed, updatedAtMillis: now } }, { returnDocument: 'after' })
            .lean();
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
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
    async issueTokens(userId, email, user) {
        const accessPayload = {
            sub: userId,
            email,
            type: 'access',
        };
        const refreshPayload = {
            sub: userId,
            email,
            type: 'refresh',
        };
        const accessExpires = this.config.get('jwt.accessExpires') ?? '15m';
        const refreshExpires = this.config.get('jwt.refreshExpires') ?? '7d';
        const accessToken = await this.jwtService.signAsync({ ...accessPayload }, { expiresIn: accessExpires });
        const refreshToken = await this.jwtService.signAsync({ ...refreshPayload }, { expiresIn: refreshExpires });
        const expiresMs = this.parseExpiry(refreshExpires);
        await this.refreshTokenModel.create({
            userId,
            tokenHash: this.hashToken(refreshToken),
            expiresAt: new Date(Date.now() + expiresMs),
            revoked: false,
        });
        return { accessToken, refreshToken, user };
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    parseExpiry(value) {
        const match = /^(\d+)([smhd])$/.exec(value);
        if (!match)
            return 7 * 24 * 60 * 60 * 1000;
        const amount = parseInt(match[1], 10);
        const unit = match[2];
        const multipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };
        return amount * (multipliers[unit] ?? multipliers.d);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.RefreshToken.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        google_token_verifier_1.GoogleTokenVerifier,
        jwt_1.JwtService,
        config_1.ConfigService,
        settings_service_1.SettingsService])
], AuthService);
function generateId() {
    return (0, crypto_1.randomBytes)(16).toString('hex');
}
