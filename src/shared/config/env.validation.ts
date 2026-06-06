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
  EXCHANGE_RATE_API_TOKEN: Joi.string().allow('').default(''),
  ENABLE_SWAGGER: Joi.boolean()
    .truthy('true', '1')
    .falsy('false', '0')
    .default(false),
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
  EXCHANGE_RATE_API_TOKEN: string;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_TTL_MS: number;
  ENABLE_SWAGGER: boolean;
};
