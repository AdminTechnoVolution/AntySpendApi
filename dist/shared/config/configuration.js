"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
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
    openRouter: {
        apiKey: process.env.OPENROUTER_API_KEY ?? '',
        model: process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash-lite',
    },
    exchangeRate: {
        apiToken: process.env.EXCHANGE_RATE_API_TOKEN ?? '',
    },
});
//# sourceMappingURL=configuration.js.map