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
};

export default nextConfig;
