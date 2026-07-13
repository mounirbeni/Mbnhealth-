import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.mbnhealth.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/find-a-clinic", "/directory", "/patient-landing", "/privacy", "/terms"],
        disallow: ["/dashboard", "/patients", "/appointments", "/billing", "/admin", "/patient/appointments", "/settings"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
