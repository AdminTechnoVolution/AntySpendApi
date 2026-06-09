import { readFileSync } from 'fs';

export const GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_NOT_CONFIGURED =
  'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_NOT_CONFIGURED';

export const GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID =
  'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID';

export type GooglePlayServiceAccountCredentials = Record<string, unknown> & {
  type: 'service_account';
  client_email: string;
  private_key: string;
};

export type GooglePlayCredentialsConfig = {
  serviceAccountJsonBase64?: string;
  serviceAccountJson?: string;
};

export class GooglePlayCredentialsError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'GooglePlayCredentialsError';
  }
}

function normalizeEnvSecret(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  let trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function normalizeBase64Input(base64: string): string {
  return base64.replace(/\s/g, '');
}

function looksLikeBase64(value: string): boolean {
  const cleaned = normalizeBase64Input(value);
  return cleaned.length >= 100 && /^[A-Za-z0-9+/=]+$/.test(cleaned);
}

function normalizePrivateKey(privateKey: string): string {
  if (privateKey.includes('\\n')) {
    return privateKey.replace(/\\n/g, '\n');
  }

  return privateKey;
}

function parseCredentialsJson(raw: string): GooglePlayServiceAccountCredentials {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new GooglePlayCredentialsError(
      GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID,
    );
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new GooglePlayCredentialsError(
      GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID,
    );
  }

  const record = parsed as Record<string, unknown>;
  if (record.type !== 'service_account') {
    throw new GooglePlayCredentialsError(
      GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID,
    );
  }

  if (
    typeof record.client_email !== 'string' ||
    record.client_email.trim() === ''
  ) {
    throw new GooglePlayCredentialsError(
      GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID,
    );
  }

  if (
    typeof record.private_key !== 'string' ||
    record.private_key.trim() === ''
  ) {
    throw new GooglePlayCredentialsError(
      GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID,
    );
  }

  record.private_key = normalizePrivateKey(record.private_key);

  return record as GooglePlayServiceAccountCredentials;
}

function decodeBase64Credentials(
  base64: string,
): GooglePlayServiceAccountCredentials {
  let decoded: string;
  try {
    decoded = Buffer.from(base64, 'base64').toString('utf8');
  } catch {
    throw new GooglePlayCredentialsError(
      GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID,
    );
  }

  return parseCredentialsJson(decoded);
}

function readCredentialsFromFile(
  filePath: string,
): GooglePlayServiceAccountCredentials {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    throw new GooglePlayCredentialsError(
      GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID,
    );
  }

  return parseCredentialsJson(raw);
}

export function loadGooglePlayServiceAccountCredentials(
  config: GooglePlayCredentialsConfig,
): GooglePlayServiceAccountCredentials {
  const base64 = normalizeEnvSecret(config.serviceAccountJsonBase64);
  if (base64) {
    return decodeBase64Credentials(normalizeBase64Input(base64));
  }

  const jsonOrPath = normalizeEnvSecret(config.serviceAccountJson);
  if (!jsonOrPath) {
    throw new GooglePlayCredentialsError(
      GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_NOT_CONFIGURED,
    );
  }

  if (jsonOrPath.startsWith('{')) {
    return parseCredentialsJson(jsonOrPath);
  }

  if (looksLikeBase64(jsonOrPath)) {
    return decodeBase64Credentials(normalizeBase64Input(jsonOrPath));
  }

  return readCredentialsFromFile(jsonOrPath);
}
