export interface AntyJwtPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
  /** Random per-token id. Without this, two tokens minted for the same user+session within the
   * same second (e.g. a race between two concurrent refresh calls) are byte-identical JWTs — same
   * signature, same hash — which collides on the refresh token's unique tokenHash index. */
  jti?: string;
  /** Identifies the login that minted this token. Absent on tokens issued before single-session
   * enforcement was added — treated as "no session check" for backward compatibility. A fresh
   * login overwrites the user's active session, so an older token's sessionId stops matching and
   * is rejected on its next use (see JwtStrategy.validate / AuthService.refresh). */
  sessionId?: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
}
