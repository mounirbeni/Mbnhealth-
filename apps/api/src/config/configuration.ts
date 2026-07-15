export default () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  // PORT is set by Vercel (and most other hosts) to whatever port they
  // expect app.listen() to bind; API_PORT is our own Docker/local-dev
  // knob. PORT must win whenever both are present.
  port: parseInt(process.env.PORT ?? process.env.API_PORT ?? "4000", 10),
  // Comma-separated so both the clinic app and the patient-portal subdomain
  // (a different origin — see apps/web/src/middleware.ts) can be allowed
  // without allowing arbitrary origins.
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:3000,http://care.localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  database: {
    url: process.env.DATABASE_URL,
  },
  // Verifies that GET /cron/reminders is actually being called by Vercel
  // Cron and not a random public request, since that route runs real
  // sends. Vercel automatically sends `Authorization: Bearer <CRON_SECRET>`
  // for its own invocations when this env var is set on the project.
  cronSecret: process.env.CRON_SECRET ?? "",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me-please-32ch",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me-please-32ch",
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "30d",
    // Deliberately a separate secret from the staff accessSecret above: a
    // patient-portal token must never be accepted by any staff endpoint
    // (and vice versa) even if a guard's strategy check were ever missed.
    patientSecret: process.env.JWT_PATIENT_SECRET ?? "dev-patient-secret-change-me-please-32ch",
    patientTtl: process.env.JWT_PATIENT_TTL ?? "30d",
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
    emailProvider: process.env.EMAIL_PROVIDER ?? "console",
    emailFrom: process.env.EMAIL_FROM ?? "MBN Health <contact@mbndev.ma>",
  },
  // Transactional email (password resets, account notices) — reuses the same
  // SMTP_* vars as `messaging.*` above so there's one email config, not two.
  // Any SMTP-speaking provider works (Gmail, SendGrid, Postmark, Resend,
  // SES...); leaving SMTP_HOST unset logs the send instead of transmitting it.
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASSWORD ?? "",
    from: process.env.EMAIL_FROM ?? "MBN Health <contact@mbndev.ma>",
  },
  appUrls: {
    // Where password-reset / account links should point the user back to.
    web: process.env.WEB_APP_URL ?? "http://localhost:3000",
    patientPortal: process.env.PATIENT_PORTAL_URL ?? "http://care.localhost:3000",
  },
  // Platform-level Meta App credentials, shared across all tenants: the
  // webhook URL and verify token are configured once in the Meta App
  // dashboard. Each clinic's own phone number / access token lives in the
  // per-tenant WhatsAppConfig database row (see whatsapp module).
  whatsapp: {
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? "",
    appSecret: process.env.WHATSAPP_APP_SECRET ?? "",
    graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION ?? "v21.0",
  },
  ai: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    priceIdStarter: process.env.STRIPE_PRICE_ID_STARTER ?? "",
    priceIdProfessional: process.env.STRIPE_PRICE_ID_PROFESSIONAL ?? "",
    priceIdEnterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE ?? "",
    checkoutSuccessUrl: process.env.STRIPE_CHECKOUT_SUCCESS_URL ?? "http://localhost:3000/settings?checkout=success",
    checkoutCancelUrl: process.env.STRIPE_CHECKOUT_CANCEL_URL ?? "http://localhost:3000/settings?checkout=cancelled",
  },
});
