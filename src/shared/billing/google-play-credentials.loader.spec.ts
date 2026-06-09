import { readFileSync } from 'fs';
import {
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID,
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_NOT_CONFIGURED,
  GooglePlayCredentialsError,
  loadGooglePlayServiceAccountCredentials,
} from './google-play-credentials.loader';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

const validCredentials = {
  type: 'service_account',
  client_email: 'play@example.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----\n',
  project_id: 'example-project',
};

describe('loadGooglePlayServiceAccountCredentials', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads credentials from base64 when configured', () => {
    const base64 = Buffer.from(JSON.stringify(validCredentials), 'utf8').toString(
      'base64',
    );

    const result = loadGooglePlayServiceAccountCredentials({
      serviceAccountJsonBase64: base64,
      serviceAccountJson: '/ignored/path.json',
    });

    expect(result).toEqual(validCredentials);
    expect(readFileSync).not.toHaveBeenCalled();
  });

  it('loads credentials from inline JSON when value starts with {', () => {
    const inline = JSON.stringify(validCredentials);

    const result = loadGooglePlayServiceAccountCredentials({
      serviceAccountJson: inline,
    });

    expect(result).toEqual(validCredentials);
    expect(readFileSync).not.toHaveBeenCalled();
  });

  it('loads credentials from filesystem path', () => {
    (readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify(validCredentials),
    );

    const result = loadGooglePlayServiceAccountCredentials({
      serviceAccountJson: '/secrets/play-sa.json',
    });

    expect(readFileSync).toHaveBeenCalledWith('/secrets/play-sa.json', 'utf8');
    expect(result).toEqual(validCredentials);
  });

  it('prefers base64 over inline JSON and file path', () => {
    const base64 = Buffer.from(JSON.stringify(validCredentials), 'utf8').toString(
      'base64',
    );

    loadGooglePlayServiceAccountCredentials({
      serviceAccountJsonBase64: base64,
      serviceAccountJson: JSON.stringify({
        ...validCredentials,
        client_email: 'other@example.iam.gserviceaccount.com',
      }),
    });

    expect(readFileSync).not.toHaveBeenCalled();
  });

  it('throws NOT_CONFIGURED when no source is set', () => {
    expect(() => loadGooglePlayServiceAccountCredentials({})).toThrow(
      GooglePlayCredentialsError,
    );

    try {
      loadGooglePlayServiceAccountCredentials({});
    } catch (error) {
      expect(error).toBeInstanceOf(GooglePlayCredentialsError);
      expect((error as GooglePlayCredentialsError).code).toBe(
        GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_NOT_CONFIGURED,
      );
    }
  });

  it('throws INVALID for invalid base64 payload', () => {
    const base64 = Buffer.from('not-json', 'utf8').toString('base64');

    expect(() =>
      loadGooglePlayServiceAccountCredentials({
        serviceAccountJsonBase64: base64,
      }),
    ).toThrow(GooglePlayCredentialsError);

    try {
      loadGooglePlayServiceAccountCredentials({
        serviceAccountJsonBase64: base64,
      });
    } catch (error) {
      expect((error as GooglePlayCredentialsError).code).toBe(
        GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID,
      );
    }
  });

  it('throws INVALID for malformed inline JSON', () => {
    expect(() =>
      loadGooglePlayServiceAccountCredentials({
        serviceAccountJson: '{not-valid-json',
      }),
    ).toThrow(GooglePlayCredentialsError);
  });

  it('throws INVALID when JSON is missing required service account fields', () => {
    expect(() =>
      loadGooglePlayServiceAccountCredentials({
        serviceAccountJson: JSON.stringify({
          type: 'service_account',
          client_email: 'play@example.iam.gserviceaccount.com',
        }),
      }),
    ).toThrow(GooglePlayCredentialsError);

    expect(() =>
      loadGooglePlayServiceAccountCredentials({
        serviceAccountJson: JSON.stringify({
          type: 'user',
          client_email: 'play@example.iam.gserviceaccount.com',
          private_key: 'key',
        }),
      }),
    ).toThrow(GooglePlayCredentialsError);
  });

  it('throws INVALID when file cannot be read', () => {
    (readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(() =>
      loadGooglePlayServiceAccountCredentials({
        serviceAccountJson: '/missing/play-sa.json',
      }),
    ).toThrow(GooglePlayCredentialsError);

    try {
      loadGooglePlayServiceAccountCredentials({
        serviceAccountJson: '/missing/play-sa.json',
      });
    } catch (error) {
      expect((error as GooglePlayCredentialsError).code).toBe(
        GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID,
      );
    }
  });

  it('accepts base64 pasted in serviceAccountJson by mistake', () => {
    const base64 = Buffer.from(JSON.stringify(validCredentials), 'utf8').toString(
      'base64',
    );

    const result = loadGooglePlayServiceAccountCredentials({
      serviceAccountJson: base64,
    });

    expect(result).toEqual(validCredentials);
    expect(readFileSync).not.toHaveBeenCalled();
  });

  it('strips surrounding quotes and whitespace from base64', () => {
    const base64 = Buffer.from(JSON.stringify(validCredentials), 'utf8').toString(
      'base64',
    );

    const result = loadGooglePlayServiceAccountCredentials({
      serviceAccountJsonBase64: `" ${base64.slice(0, 20)}\n${base64.slice(20)}" `,
    });

    expect(result).toEqual(validCredentials);
  });

  it('normalizes escaped newlines in private_key', () => {
    const result = loadGooglePlayServiceAccountCredentials({
      serviceAccountJson: JSON.stringify({
        ...validCredentials,
        private_key:
          '-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n',
      }),
    });

    expect(result.private_key).toBe(validCredentials.private_key);
  });
});
