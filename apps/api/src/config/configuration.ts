export default () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.API_PORT ?? "4000", 10),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me-please-32ch",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me-please-32ch",
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "30d",
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "us-east-1",
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET ?? "mbn-health-attachments",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL ?? "60", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10),
  },
  messaging: {
    smsProvider: process.env.SMS_PROVIDER ?? "none",
    whatsappProvider: process.env.WHATSAPP_PROVIDER ?? "none",
    emailProvider: process.env.EMAIL_PROVIDER ?? "console",
    emailFrom: process.env.EMAIL_FROM ?? "MBN Health <no-reply@mbnhealth.com>",
  },
  ai: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  },
});
