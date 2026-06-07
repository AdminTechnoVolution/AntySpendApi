import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { AccountDeletionService } from '../application/account-deletion.service';
import { AuthService } from '../application/auth.service';
import { AuthTokensResponseDto, AuthUserDto, DeleteAccountResponseDto, GoogleAuthDto, LogoutResponseDto, RefreshTokenDto, UpdateProfileDto } from '../dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    private readonly accountDeletionService;
    constructor(authService: AuthService, accountDeletionService: AccountDeletionService);
    google(dto: GoogleAuthDto): Promise<AuthTokensResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<AuthTokensResponseDto>;
    logout(dto: RefreshTokenDto): Promise<LogoutResponseDto>;
    me(user: AuthenticatedUser): Promise<AuthUserDto>;
    updateProfile(user: AuthenticatedUser, dto: UpdateProfileDto): Promise<AuthUserDto>;
    deleteAccount(user: AuthenticatedUser): Promise<DeleteAccountResponseDto>;
}
