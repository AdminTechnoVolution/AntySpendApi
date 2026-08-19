export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  googlePlay: {
    packageName:
      process.env.GOOGLE_PLAY_PACKAGE_NAME ?? 'com.technovolution.antyspend',
    serviceAccountJsonBase64:
      process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64 ?? '',
    serviceAccountJson: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON ?? '',
  },
  rtdn: {
    enabled:
      process.env.RTDN_ENABLED === 'true' || process.env.RTDN_ENABLED === '1',
    skipAuth:
      process.env.RTDN_SKIP_AUTH === 'true' ||
      process.env.RTDN_SKIP_AUTH === '1',
    pubsubPushAudience: process.env.GOOGLE_PUBSUB_PUSH_AUDIENCE ?? '',
    pubsubPushServiceAccountEmail:
      process.env.GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT_EMAIL ?? '',
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
    model: process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash-lite',
    visionModel:
      process.env.OPENROUTER_VISION_MODEL ?? 'google/gemini-2.5-flash',
    receiptModel:
      process.env.OPENROUTER_RECEIPT_MODEL ?? 'google/gemini-2.5-flash',
    receiptTimeoutMs: parseInt(
      process.env.OPENROUTER_RECEIPT_TIMEOUT_MS ?? '15000',
      10,
    ),
    receiptMaxTokens: parseInt(
      process.env.OPENROUTER_RECEIPT_MAX_TOKENS ?? '1600',
      10,
    ),
  },
  exchangeRate: {
    apiToken: process.env.EXCHANGE_RATE_API_TOKEN ?? '',
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '50', 10),
    ttlMs: parseInt(process.env.RATE_LIMIT_TTL_MS ?? '60000', 10),
  },
  enableSwagger:
    process.env.ENABLE_SWAGGER === 'true' || process.env.ENABLE_SWAGGER === '1',
  devUnlockPremium:
    process.env.DEV_UNLOCK_PREMIUM === 'true' ||
    process.env.DEV_UNLOCK_PREMIUM === '1',
});
