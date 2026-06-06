export interface AntyJwtPayload {
    sub: string;
    email: string;
    type: 'access' | 'refresh';
}
export interface AuthenticatedUser {
    userId: string;
    email: string;
}
