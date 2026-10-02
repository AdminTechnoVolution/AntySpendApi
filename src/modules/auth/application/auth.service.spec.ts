import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService profile', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();
  const findByIdAndUpdate = jest.fn();
  const findById = jest.fn();
  const updateOne = jest.fn();
  const userModel = {
    findOne,
    findOneAndUpdate,
    findByIdAndUpdate,
    findById,
    updateOne,
  };

  const refreshTokenModel = {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
  };

  const googleVerifier = {
    verifyIdToken: jest.fn(),
  };

  const appleVerifier = {
    verifyIdentityToken: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('token'),
    verifyAsync: jest.fn(),
  };

  const config = {
    get: jest.fn((key: string) => {
      if (key === 'jwt.accessExpires') return '15m';
      if (key === 'jwt.refreshExpires') return '7d';
      return undefined;
    }),
  };

  const settingsUpdate = jest.fn();
  const findByUserId = jest.fn();
  const ensureForUser = jest.fn();
  const settingsService = {
    update: settingsUpdate,
    findByUserId,
    ensureForUser,
  };

  let service: AuthService;

  const userId = '507f1f77bcf86cd799439011';
  const googleProfile = {
    googleSub: 'google-sub-1',
    email: 'user@example.com',
    name: 'Google Name',
    picture: 'https://example.com/pic.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      userModel as never,
      refreshTokenModel as never,
      googleVerifier as never,
      appleVerifier as never,
      jwtService as never,
      config as never,
      settingsService as never,
    );
  });

  describe('updateProfile', () => {
    it('writes users.name and user_settings.googleUserName', async () => {
      const updatedUser = {
        _id: { toString: () => userId },
        email: 'user@example.com',
        name: 'María',
        picture: 'https://example.com/pic.jpg',
        createdAtMillis: 1,
        updatedAtMillis: 2,
      };
      findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(updatedUser),
      });
      settingsUpdate.mockResolvedValue({});

      const result = await service.updateProfile(userId, '  María  ');

      expect(findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          $set: expect.objectContaining({ name: 'María' }),
        }),
        { returnDocument: 'after' },
      );
      expect(settingsUpdate).toHaveBeenCalledWith(userId, {
        googleUserName: 'María',
        displayNameUserEdited: true,
      });
      expect(result.name).toBe('María');
    });

    it('rejects empty name', async () => {
      await expect(service.updateProfile(userId, '   ')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects name longer than 50 characters', async () => {
      await expect(
        service.updateProfile(userId, 'a'.repeat(51)),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('loginWithGoogle name protection', () => {
    beforeEach(() => {
      googleVerifier.verifyIdToken.mockResolvedValue(googleProfile);
      ensureForUser.mockResolvedValue(undefined);
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: { toString: () => userId },
          email: googleProfile.email,
          name: 'Custom Name',
          picture: googleProfile.picture,
        }),
      });
      findOneAndUpdate.mockReturnValue({
        _id: { toString: () => userId },
        email: googleProfile.email,
        name: 'Custom Name',
        picture: googleProfile.picture,
      });
    });

    it('does not overwrite users.name when displayNameUserEdited is true', async () => {
      findByUserId.mockResolvedValue({
        displayNameUserEdited: true,
        googleUserName: 'Custom Name',
      });

      await service.loginWithGoogle('id-token');

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { googleSub: googleProfile.googleSub },
        expect.objectContaining({
          $set: expect.not.objectContaining({ name: googleProfile.name }),
        }),
        expect.any(Object),
      );
      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { googleSub: googleProfile.googleSub },
        expect.objectContaining({
          $set: expect.objectContaining({
            email: googleProfile.email,
            picture: googleProfile.picture,
          }),
        }),
        expect.any(Object),
      );
    });

    it('updates users.name when displayNameUserEdited is false', async () => {
      findByUserId.mockResolvedValue({
        displayNameUserEdited: false,
        googleUserName: 'Old Name',
      });

      await service.loginWithGoogle('id-token');

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { googleSub: googleProfile.googleSub },
        expect.objectContaining({
          $set: expect.objectContaining({ name: googleProfile.name }),
        }),
        expect.any(Object),
      );
    });

    it('starts a new session, revoking other devices on login', async () => {
      findByUserId.mockResolvedValue(null);

      await service.loginWithGoogle('id-token');

      expect(updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { $set: { activeSessionId: expect.any(String) } },
      );
      expect(refreshTokenModel.updateMany).toHaveBeenCalledWith(
        { userId, revoked: false },
        { $set: { revoked: true } },
      );
    });
  });

  describe('loginWithApple', () => {
    const appleProfile = {
      appleSub: 'apple-sub-1',
      email: 'apple@example.com',
    };

    it('creates an Apple identity without populating googleSub', async () => {
      appleVerifier.verifyIdentityToken.mockResolvedValue(appleProfile);
      findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      findOneAndUpdate.mockResolvedValue({
        _id: { toString: () => userId },
        email: appleProfile.email,
        name: 'Apple Person',
        picture: undefined,
      });

      const result = await service.loginWithApple(
        'identity-token',
        'hashed-nonce',
        'Apple Person',
      );

      expect(result.accessToken).toBe('token');
      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { appleSub: appleProfile.appleSub },
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({
            appleSub: appleProfile.appleSub,
          }),
        }),
        expect.any(Object),
      );
      expect(settingsService.ensureForUser).toHaveBeenCalled();
    });

    it('defaults the name to the email local-part on first signup with no name given (never the Apple sub)', async () => {
      appleVerifier.verifyIdentityToken.mockResolvedValue(appleProfile);
      findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      findOneAndUpdate.mockResolvedValue({
        _id: { toString: () => userId },
        email: appleProfile.email,
        name: 'apple',
        picture: undefined,
      });

      await service.loginWithApple('identity-token', 'hashed-nonce', undefined);

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { appleSub: appleProfile.appleSub },
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({
            appleSub: appleProfile.appleSub,
            name: 'apple',
          }),
        }),
        expect.any(Object),
      );
      // `name` must never be targeted by both $set and $setOnInsert in the same
      // update (Mongo rejects that as a conflicting path).
      const call = findOneAndUpdate.mock.calls[0][1];
      if (Object.prototype.hasOwnProperty.call(call.$set, 'name')) {
        expect(
          Object.prototype.hasOwnProperty.call(call.$setOnInsert, 'name'),
        ).toBe(false);
      }
    });

    it('never puts name in both $set and $setOnInsert when a name is given on first signup', async () => {
      appleVerifier.verifyIdentityToken.mockResolvedValue(appleProfile);
      findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      findOneAndUpdate.mockResolvedValue({
        _id: { toString: () => userId },
        email: appleProfile.email,
        name: 'Apple Person',
        picture: undefined,
      });

      await service.loginWithApple(
        'identity-token',
        'hashed-nonce',
        'Apple Person',
      );

      const call = findOneAndUpdate.mock.calls[0][1];
      const setHasName = Object.prototype.hasOwnProperty.call(
        call.$set,
        'name',
      );
      const setOnInsertHasName = Object.prototype.hasOwnProperty.call(
        call.$setOnInsert,
        'name',
      );
      expect(setHasName && setOnInsertHasName).toBe(false);
      expect(setOnInsertHasName).toBe(true);
      expect(call.$setOnInsert.name).toBe('Apple Person');
    });

    it('preserves an existing real name on re-login when Apple sends no name', async () => {
      appleVerifier.verifyIdentityToken.mockResolvedValue(appleProfile);
      findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: { toString: () => userId },
          email: appleProfile.email,
          name: 'María Real Name',
        }),
      });
      findByUserId.mockResolvedValue(null);
      findOneAndUpdate.mockResolvedValue({
        _id: { toString: () => userId },
        email: appleProfile.email,
        name: 'María Real Name',
        picture: undefined,
      });

      const result = await service.loginWithApple(
        'identity-token',
        'hashed-nonce',
        undefined,
      );

      const call = findOneAndUpdate.mock.calls[0][1];
      expect(Object.prototype.hasOwnProperty.call(call.$set, 'name')).toBe(
        false,
      );
      expect(result.user.name).toBe('María Real Name');
    });

    it('does not merge an Apple identity into an existing email account', async () => {
      appleVerifier.verifyIdentityToken.mockResolvedValue(appleProfile);
      findOne
        .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ _id: { toString: () => 'google-user' } }),
        });

      await expect(
        service.loginWithApple('identity-token', 'hashed-nonce'),
      ).rejects.toThrow('already linked to another sign-in provider');
      expect(findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    beforeEach(() => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        type: 'refresh',
      });
    });

    it('rejects an unknown refresh token', async () => {
      refreshTokenModel.findOne.mockResolvedValue(null);

      await expect(service.refresh('refresh-jwt')).rejects.toThrow(
        'Refresh token expired or revoked',
      );
      expect(refreshTokenModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects an expired, not-yet-revoked refresh token', async () => {
      refreshTokenModel.findOne.mockResolvedValue({
        revoked: false,
        expiresAt: new Date(Date.now() - 60_000),
      });

      await expect(service.refresh('refresh-jwt')).rejects.toThrow(
        'Refresh token expired or revoked',
      );
      expect(refreshTokenModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('issues new tokens and atomically revokes+caches the rotation result', async () => {
      refreshTokenModel.findOne.mockResolvedValue({
        revoked: false,
        expiresAt: new Date(Date.now() + 60_000),
      });
      findById.mockResolvedValue({
        _id: { toString: () => userId },
        email: googleProfile.email,
        name: 'Google Name',
        picture: googleProfile.picture,
      });
      refreshTokenModel.findOneAndUpdate.mockResolvedValue({ _id: 'doc' });

      const result = await service.refresh('refresh-jwt');

      expect(result.accessToken).toBe('token');
      expect(refreshTokenModel.findOneAndUpdate).toHaveBeenCalledWith(
        { tokenHash: expect.any(String), revoked: false },
        expect.objectContaining({
          $set: expect.objectContaining({
            revoked: true,
            rotationResult: expect.objectContaining({
              accessToken: 'token',
              refreshToken: 'token',
            }),
          }),
        }),
        { returnDocument: 'after' },
      );
    });

    it('rejects a refresh token whose session was superseded by a newer login elsewhere', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        type: 'refresh',
        sessionId: 'old-session',
      });
      refreshTokenModel.findOne.mockResolvedValue({
        revoked: false,
        expiresAt: new Date(Date.now() + 60_000),
      });
      findById.mockResolvedValue({
        _id: { toString: () => userId },
        email: googleProfile.email,
        name: 'Google Name',
        picture: googleProfile.picture,
        activeSessionId: 'new-session',
      });

      await expect(service.refresh('refresh-jwt')).rejects.toThrow(
        'Session was signed out from another device',
      );
      expect(refreshTokenModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('reuses the winning rotation result when it loses the concurrent-refresh race', async () => {
      // The token is already revoked by a sibling request, and its atomically-written
      // rotationResult is present — this must succeed instead of throwing 401, which is
      // exactly the race that used to log users out unexpectedly.
      refreshTokenModel.findOne
        .mockResolvedValueOnce({ revoked: true }) // first lookup: already revoked
        .mockResolvedValueOnce({
          revoked: true,
          rotationResult: {
            accessToken: 'winner-access',
            refreshToken: 'winner-refresh',
            issuedAtMillis: Date.now(),
          },
        });
      findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: { toString: () => userId },
          email: googleProfile.email,
          name: 'Google Name',
          picture: googleProfile.picture,
        }),
      });

      const result = await service.refresh('refresh-jwt');

      expect(result.accessToken).toBe('winner-access');
      expect(result.refreshToken).toBe('winner-refresh');
      expect(refreshTokenModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects when revoked with a stale or missing rotation result', async () => {
      refreshTokenModel.findOne
        .mockResolvedValueOnce({ revoked: true })
        .mockResolvedValueOnce({ revoked: true, rotationResult: undefined });

      await expect(service.refresh('refresh-jwt')).rejects.toThrow(
        'Refresh token expired or revoked',
      );
    });
  });
});
