"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GooglePlayCredentialsError = exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID = exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_NOT_CONFIGURED = void 0;
exports.loadGooglePlayServiceAccountCredentials = loadGooglePlayServiceAccountCredentials;
const fs_1 = require("fs");
exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_NOT_CONFIGURED = 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_NOT_CONFIGURED';
exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID = 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID';
class GooglePlayCredentialsError extends Error {
    code;
    constructor(code) {
        super(code);
        this.code = code;
        this.name = 'GooglePlayCredentialsError';
    }
}
exports.GooglePlayCredentialsError = GooglePlayCredentialsError;
function normalizeEnvSecret(value) {
    if (!value) {
        return undefined;
    }
    let trimmed = value.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        trimmed = trimmed.slice(1, -1).trim();
    }
    return trimmed;
}
function normalizeBase64Input(base64) {
    return base64.replace(/\s/g, '');
}
function looksLikeBase64(value) {
    const cleaned = normalizeBase64Input(value);
    return cleaned.length >= 100 && /^[A-Za-z0-9+/=]+$/.test(cleaned);
}
function normalizePrivateKey(privateKey) {
    if (privateKey.includes('\\n')) {
        return privateKey.replace(/\\n/g, '\n');
    }
    return privateKey;
}
function parseCredentialsJson(raw) {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw new GooglePlayCredentialsError(exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID);
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new GooglePlayCredentialsError(exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID);
    }
    const record = parsed;
    if (record.type !== 'service_account') {
        throw new GooglePlayCredentialsError(exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID);
    }
    if (typeof record.client_email !== 'string' ||
        record.client_email.trim() === '') {
        throw new GooglePlayCredentialsError(exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID);
    }
    if (typeof record.private_key !== 'string' ||
        record.private_key.trim() === '') {
        throw new GooglePlayCredentialsError(exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID);
    }
    record.private_key = normalizePrivateKey(record.private_key);
    return record;
}
function decodeBase64Credentials(base64) {
    let decoded;
    try {
        decoded = Buffer.from(base64, 'base64').toString('utf8');
    }
    catch {
        throw new GooglePlayCredentialsError(exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID);
    }
    return parseCredentialsJson(decoded);
}
function readCredentialsFromFile(filePath) {
    let raw;
    try {
        raw = (0, fs_1.readFileSync)(filePath, 'utf8');
    }
    catch {
        throw new GooglePlayCredentialsError(exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID);
    }
    return parseCredentialsJson(raw);
}
function loadGooglePlayServiceAccountCredentials(config) {
    const base64 = normalizeEnvSecret(config.serviceAccountJsonBase64);
    if (base64) {
        return decodeBase64Credentials(normalizeBase64Input(base64));
    }
    const jsonOrPath = normalizeEnvSecret(config.serviceAccountJson);
    if (!jsonOrPath) {
        throw new GooglePlayCredentialsError(exports.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_NOT_CONFIGURED);
    }
    if (jsonOrPath.startsWith('{')) {
        return parseCredentialsJson(jsonOrPath);
    }
    if (looksLikeBase64(jsonOrPath)) {
        return decodeBase64Credentials(normalizeBase64Input(jsonOrPath));
    }
    return readCredentialsFromFile(jsonOrPath);
}
