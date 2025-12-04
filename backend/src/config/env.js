import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/greenharvest',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  accessTokenTtl: process.env.JWT_ACCESS_TTL || '15m',
  refreshTokenTtl: process.env.JWT_REFRESH_TTL || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  metricsUser: process.env.METRICS_USER || 'metrics',
  metricsPass: process.env.METRICS_PASS || 'metrics',
  mailTransportJson: process.env.MAIL_TRANSPORT_JSON || '{"service":"gmail","auth":{"user":"kallemlikitha2007@gmail.com","pass":"rjrymajoigsevuzk"}}',
  mailFrom: process.env.MAIL_FROM || 'kallemlikitha2007@gmail.com',
  adminAlertEmail: process.env.ADMIN_ALERT_EMAIL || '',
  grafanaBaseUrl: process.env.GRAFANA_BASE_URL || 'http://localhost:3000',
  appVersion: process.env.APP_VERSION || 'dev',
};

