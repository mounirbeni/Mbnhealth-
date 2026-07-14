import { NextRequest, NextResponse } from "next/server";

// The patient portal and the clinic app are the same Next.js deployment but
// must never feel like the same product on the same page — this middleware
// is the actual host-based wall between them. Configure PATIENT_HOST /
// NEXT_PUBLIC_PATIENT_HOST to the real subdomain in production (see README
// "Patient portal" section); for local dev, Chromium/Firefox resolve any
// `*.localhost` hostname to 127.0.0.1 automatically, so no /etc/hosts entry
// is needed — just visit http://care.localhost:3000.
const PATIENT_HOST = process.env.PATIENT_HOST ?? process.env.NEXT_PUBLIC_PATIENT_HOST ?? "care.localhost:3000";

const PATIENT_PATH_PREFIXES = ["/find-a-clinic", "/clinics", "/directory", "/patient"];

// Legal pages make sense on both the clinic app and the patient portal, so
// they're exempt from the host-based wall in both directions.
const SHARED_PATH_PREFIXES = ["/privacy", "/terms"];

function isPatientOnlyPath(pathname: string): boolean {
  return PATIENT_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isSharedPath(pathname: string): boolean {
  return SHARED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

// PWA assets (manifest, generated icons, service worker) must resolve the
// same way regardless of which host requested them — a browser installing
// the patient portal as an app needs its manifest/icons served, not redirected
// away by the same host-based wall that separates the two products' pages.
const PWA_PATHS = ["/manifest.webmanifest", "/icon", "/apple-icon", "/icon-192.png", "/icon-512.png", "/sw.js"];

function isAssetOrApiPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    PWA_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  );
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  if (isAssetOrApiPath(pathname) || isSharedPath(pathname)) return NextResponse.next();

  const isPatientHost = host === PATIENT_HOST;

  if (isPatientHost) {
    // The patient subdomain only ever serves the patient portal — staff
    // routes (dashboard, login, settings...) simply don't exist here. The
    // root path rewrites (not redirects) to the landing page so the browser
    // URL stays a clean "/" instead of visibly jumping to /find-a-clinic.
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/patient-landing", request.url));
    }
    if (!isPatientOnlyPath(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Conversely, the main app/marketing domain never serves patient-portal
  // pages — send any such request to the correct subdomain instead of
  // rendering it inline next to the clinic-facing product.
  if (isPatientOnlyPath(pathname)) {
    const target = new URL(request.url);
    target.host = PATIENT_HOST;
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
