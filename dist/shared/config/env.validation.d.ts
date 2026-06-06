import * as Joi from 'joi';
export declare const envValidationSchema: Joi.ObjectSchema<any>;
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
};
