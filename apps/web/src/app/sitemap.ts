import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.mbnhealth.com";
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface DirectorySlug {
  slug: string;
}

async function getDirectorySlugs(): Promise<DirectorySlug[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/public/directory`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const listings: { slug: string }[] = await res.json();
    return listings.map((l) => ({ slug: l.slug }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/find-a-clinic`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/patient-landing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const listings = await getDirectorySlugs();
  const directoryRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${SITE_URL}/directory/${listing.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...directoryRoutes];
}
