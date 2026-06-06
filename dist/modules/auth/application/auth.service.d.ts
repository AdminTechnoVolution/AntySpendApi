import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { GoogleTokenVerifier } from '../../../shared/auth/google-token.verifier';
import { RefreshTokenDocument, UserDocument } from '../infrastructure/user.schema';
import { SettingsService } from '../../settings/application/settings.service';
export declare class AuthService {
    private readonly userModel;
    private readonly refreshTokenModel;
    private readonly googleVerifier;
    private readonly jwtService;
    private readonly config;
    private readonly settingsService;
    constructor(userModel: Model<UserDocument>, refreshTokenModel: Model<RefreshTokenDocument>, googleVerifier: GoogleTokenVerifier, jwtService: JwtService, config: ConfigService, settingsService: SettingsService);
    loginWithGoogle(idToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            picture?: string;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            picture?: string;
        };
    }>;
    logout(refreshToken: string): Promise<{
        success: boolean;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        picture: string | undefined;
        createdAtMillis: number;
        updatedAtMillis: number;
    }>;
    updateProfile(userId: string, name: string): Promise<{
        id: string;
        email: string;
        name: string;
        picture: string | undefined;
        createdAtMillis: number;
        updatedAtMillis: number;
    }>;
    private issueTokens;
    private hashToken;
    private parseExpiry;
}
export declare function generateId(): string;
