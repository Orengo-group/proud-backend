import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required().description('PostgreSQL connection string'),
  JWT_SECRET: Joi.string().min(32).required().description('Secret key for signing JWTs'),
  JWT_EXPIRES_IN: Joi.string().default('7d').description('JWT expiry duration'),
  CORS_ORIGIN: Joi.string().default('*').description('Allowed CORS origin(s)'),
});
