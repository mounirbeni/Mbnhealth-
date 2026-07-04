import * as Sentry from "@sentry/nextjs";

// Unset NEXT_PUBLIC_SENTRY_DSN in dev (the default): Sentry.init with an
// empty dsn is a documented no-op, so this file is always safe to load.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
