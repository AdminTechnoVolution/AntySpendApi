import { UnauthorizedException } from '@nestjs/common';

const verifyIdToken = jest.fn();

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken })),
}));

import { GoogleTokenVerifier } from './google-token.verifier';

describe('GoogleTokenVerifier', () => {
  const config = { get: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects when no client id is configured', async () => {
    config.get.mockReturnValue(undefined);
    const verifier = new GoogleTokenVerifier(config as never);

    await expect(verifier.verifyIdToken('a-token')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('accepts a token audienced to any client id in the comma-separated list (e.g. an iOS build, not just the Android Web Client ID)', async () => {
    config.get.mockReturnValue(
      'web-client-id.apps.googleusercontent.com, ios-client-id.apps.googleusercontent.com ,ios-dev-client-id.apps.googleusercontent.com',
    );
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-sub-1',
        email: 'user@example.com',
        name: 'A User',
        picture: 'https://example.com/pic.jpg',
      }),
    });
    const verifier = new GoogleTokenVerifier(config as never);

    const profile = await verifier.verifyIdToken('an-ios-issued-token');

    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: 'an-ios-issued-token',
      audience: [
        'web-client-id.apps.googleusercontent.com',
        'ios-client-id.apps.googleusercontent.com',
        'ios-dev-client-id.apps.googleusercontent.com',
      ],
    });
    expect(profile).toEqual({
      googleSub: 'google-sub-1',
      email: 'user@example.com',
      name: 'A User',
      picture: 'https://example.com/pic.jpg',
    });
  });

  it('wraps a verification failure (e.g. audience not in the list) as an UnauthorizedException', async () => {
    config.get.mockReturnValue('web-client-id.apps.googleusercontent.com');
    verifyIdToken.mockRejectedValue(new Error('Wrong recipient'));
    const verifier = new GoogleTokenVerifier(config as never);

    await expect(verifier.verifyIdToken('bad-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
