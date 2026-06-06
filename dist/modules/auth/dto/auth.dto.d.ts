export declare class GoogleAuthDto {
    idToken: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthUserDto {
    id: string;
    email: string;
    name: string;
    picture?: string;
}
export declare class AuthTokensResponseDto {
    accessToken: string;
    refreshToken: string;
    user: AuthUserDto;
}
export declare class LogoutResponseDto {
    success: boolean;
}
export declare class UpdateProfileDto {
    name: string;
}
