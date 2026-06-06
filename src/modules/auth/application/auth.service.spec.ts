import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService profile', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();
  const findByIdAndUpdate = jest.fn();
  const findById = jest.fn();
  const userModel = {
    findOne,
    findOneAndUpdate,
    findByIdAndUpdate,
    findById,
  };

  const refreshTokenModel = {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    create: jest.fn(),
  };

  const googleVerifier = {
    verifyIdToken: jest.fn(),
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
  });
});
