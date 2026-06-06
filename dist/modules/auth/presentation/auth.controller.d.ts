import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { AuthService } from '../application/auth.service';
import { AuthTokensResponseDto, AuthUserDto, GoogleAuthDto, LogoutResponseDto, RefreshTokenDto, UpdateProfileDto } from '../dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    google(dto: GoogleAuthDto): Promise<AuthTokensResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<AuthTokensResponseDto>;
    logout(dto: RefreshTokenDto): Promise<LogoutResponseDto>;
    me(user: AuthenticatedUser): Promise<AuthUserDto>;
    updateProfile(user: AuthenticatedUser, dto: UpdateProfileDto): Promise<AuthUserDto>;
}
