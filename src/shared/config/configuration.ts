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
    serviceAccountJson: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON ?? '',
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
    model: process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash-lite',
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
});
