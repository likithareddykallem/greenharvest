// backend/src/config/env.js
// Centralized environment configuration with validation

const path = require('path');
const Joi = require('joi');
const dotenv = require('dotenv');

// Load .env from project root (../.. from this file)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(5000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),

  // Database
  MONGODB_URI: Joi.string().uri({ scheme: [/mongodb(\+srv)?/] }).default('mongodb://localhost:27017/greenharvest'),

  // Redis / cache
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).default('redis://127.0.0.1:6379'),

  // Auth
  JWT_SECRET: Joi.string().min(12).default('dev_jwt_secret_change_me'),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  REFRESH_TOKEN_SECRET: Joi.string().min(12).default('dev_refresh_secret_change_me'),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),

  // Third-party integrations (optional defaults)
  STRIPE_SECRET_KEY: Joi.string().allow('', null),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow('', null),
  CLOUDINARY_URL: Joi.string().allow('', null),
  SENDGRID_API_KEY: Joi.string().allow('', null),
  TWILIO_ACCOUNT_SID: Joi.string().allow('', null),
  TWILIO_AUTH_TOKEN: Joi.string().allow('', null),

  // Observability
  PROMETHEUS_BASIC_AUTH_USER: Joi.string().allow('', null),
  PROMETHEUS_BASIC_AUTH_PASS: Joi.string().allow('', null),
}).unknown(true);

const { value, error } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`❌ Invalid environment configuration:\n${error.details.map((d) => ` - ${d.message}`).join('\n')}`);
}

const config = {
  env: value.NODE_ENV,
  isDev: value.NODE_ENV === 'development',
  isTest: value.NODE_ENV === 'test',
  server: {
    port: value.PORT,
    frontendUrl: value.FRONTEND_URL,
  },
  mongo: {
    uri: value.MONGODB_URI,
  },
  redis: {
    url: value.REDIS_URL,
  },
  auth: {
    jwt: {
      secret: value.JWT_SECRET,
      expiresIn: value.JWT_EXPIRES_IN,
    },
    refresh: {
      secret: value.REFRESH_TOKEN_SECRET,
      expiresIn: value.REFRESH_TOKEN_EXPIRES_IN,
    },
  },
  integrations: {
    stripeSecretKey: value.STRIPE_SECRET_KEY,
    stripeWebhookSecret: value.STRIPE_WEBHOOK_SECRET,
    cloudinaryUrl: value.CLOUDINARY_URL,
    sendgridApiKey: value.SENDGRID_API_KEY,
    twilio: {
      accountSid: value.TWILIO_ACCOUNT_SID,
      authToken: value.TWILIO_AUTH_TOKEN,
    },
  },
  observability: {
    prometheusBasicAuth: value.PROMETHEUS_BASIC_AUTH_USER && value.PROMETHEUS_BASIC_AUTH_PASS
      ? {
          username: value.PROMETHEUS_BASIC_AUTH_USER,
          password: value.PROMETHEUS_BASIC_AUTH_PASS,
        }
      : null,
  },
};

module.exports = config;

