export interface AntyJwtPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
  /** Random per-token id. Without this, two tokens minted for the same user+session within the
   * same second (e.g. a race between two concurrent refresh calls) are byte-identical JWTs — same
   * signature, same hash — which collides on the refresh token's unique tokenHash index. */
  jti?: string;
  /** Identifies the login that minted this token; each login has an independent expiry window. */
  sessionId?: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
}
