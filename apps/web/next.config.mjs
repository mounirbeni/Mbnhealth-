import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  // Next dev's cross-origin asset protection otherwise 404s _next/static
  // requests from the patient-portal subdomain (see middleware.ts) since it
  // isn't the host the dev server was first opened on. Production builds
  // aren't affected — there's no dev-asset origin check outside `next dev`.
  allowedDevOrigins: ["care.localhost", "localhost"],
  // Required on Next 14 for src/instrumentation.ts (sentry.server/edge.config)
  // to load; stable by default from Next 15 onward.
  experimental: { instrumentationHook: true },
};

// No-op without SENTRY_DSN (see sentry.*.config.ts / instrumentation-client.ts)
// — and without SENTRY_AUTH_TOKEN this wrapper just skips the source-map
// upload step, so it's safe to always apply regardless of whether monitoring
// is configured.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: false,
  sourcemaps: { disable: true },
  webpack: { automaticVercelMonitors: false, treeshake: { removeDebugLogging: true } },
});
