import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string()
    .pattern(/^mongodb(\+srv)?:\/\//)
    .required(),
  RATE_LIMIT_MAX: Joi.number().default(50),
  RATE_LIMIT_TTL_MS: Joi.number().default(60000),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES: Joi.string().default('7d'),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  OPENROUTER_API_KEY: Joi.string().allow('').default(''),
  OPENROUTER_MODEL: Joi.string().default('google/gemini-2.5-flash-lite'),
  OPENROUTER_VISION_MODEL: Joi.string().default('google/gemini-2.5-flash'),
  OPENROUTER_RECEIPT_MODEL: Joi.string().default('google/gemini-2.5-flash'),
  OPENROUTER_RECEIPT_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .max(60000)
    .default(15000),
  OPENROUTER_RECEIPT_MAX_TOKENS: Joi.number()
    .integer()
    .min(100)
    .max(2000)
    .default(900),
  EXCHANGE_RATE_API_TOKEN: Joi.string().allow('').default(''),
  ENABLE_SWAGGER: Joi.boolean()
    .truthy('true', '1')
    .falsy('false', '0')
    .default(false),
  GOOGLE_PLAY_PACKAGE_NAME: Joi.string().default(
    'com.technovolution.antyspend',
  ),
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64: Joi.string().allow('').default(''),
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: Joi.string().allow('').default(''),
  RTDN_ENABLED: Joi.boolean()
    .truthy('true', '1')
    .falsy('false', '0')
    .default(false),
  RTDN_SKIP_AUTH: Joi.boolean()
    .truthy('true', '1')
    .falsy('false', '0')
    .default(false),
  GOOGLE_PUBSUB_PUSH_AUDIENCE: Joi.string().allow('').default(''),
  GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT_EMAIL: Joi.string().allow('').default(''),
});

export type EnvConfig = {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_EXPIRES: string;
  GOOGLE_CLIENT_ID: string;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
  OPENROUTER_VISION_MODEL: string;
  OPENROUTER_RECEIPT_MODEL: string;
  OPENROUTER_RECEIPT_TIMEOUT_MS: number;
  OPENROUTER_RECEIPT_MAX_TOKENS: number;
  EXCHANGE_RATE_API_TOKEN: string;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_TTL_MS: number;
  ENABLE_SWAGGER: boolean;
  GOOGLE_PLAY_PACKAGE_NAME: string;
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64: string;
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: string;
  RTDN_ENABLED: boolean;
  RTDN_SKIP_AUTH: boolean;
  GOOGLE_PUBSUB_PUSH_AUDIENCE: string;
  GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT_EMAIL: string;
};
