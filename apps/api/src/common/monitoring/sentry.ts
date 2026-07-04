import * as Sentry from "@sentry/node";

// Fully optional: with SENTRY_DSN unset (the default in dev and unless
// explicitly configured in production), this is a no-op — no network calls,
// no captured data. Set SENTRY_DSN on the Vercel project to turn it on.
let initialized = false;

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  });
  initialized = true;
}

export function captureException(exception: unknown): void {
  if (!initialized) return;
  Sentry.captureException(exception);
}
