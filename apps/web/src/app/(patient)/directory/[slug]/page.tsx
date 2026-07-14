import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DirectoryListingContent } from "./listing-content";
import type { ListingDetail } from "./types";

export const revalidate = 3600; // directory data changes rarely — safe to cache and revalidate hourly

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.mbnhealth.com";

async function getListing(slug: string): Promise<ListingDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/public/directory/${slug}`, { next: { revalidate } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Directory fetch failed: ${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const listing = await getListing(params.slug);
  if (!listing) return { title: "Clinic not found — MBN Health" };

  const specialty = listing.specialties[0];
  const title = `${listing.name}${specialty ? ` — ${specialty}` : ""} in ${listing.city} | MBN Health`;
  const description =
    listing.aboutText ??
    `${listing.name} is a private clinic${specialty ? ` specializing in ${specialty}` : ""} in ${listing.city}, Morocco. Find contact details, opening hours and request an appointment on MBN Health.`;
  const url = `${SITE_URL}/directory/${listing.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: listing.photos[0]?.url ? [{ url: listing.photos[0].url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function buildJsonLd(listing: ListingDetail, url: string) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: listing.name,
    url,
    ...(listing.address
      ? { address: { "@type": "PostalAddress", streetAddress: listing.address, addressLocality: listing.city, addressCountry: "MA" } }
      : { address: { "@type": "PostalAddress", addressLocality: listing.city, addressCountry: "MA" } }),
    ...(listing.latitude && listing.longitude
      ? { geo: { "@type": "GeoCoordinates", latitude: listing.latitude, longitude: listing.longitude } }
      : {}),
    ...(listing.phone ? { telephone: listing.phone } : {}),
    ...(listing.website ? { sameAs: [listing.website] } : {}),
    ...(listing.specialties.length ? { medicalSpecialty: listing.specialties } : {}),
    ...(listing.rating && listing.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: listing.rating,
            reviewCount: listing.reviewCount,
          },
        }
      : {}),
  };
  return jsonLd;
}

export default async function DirectoryListingPage({ params }: { params: { slug: string } }) {
  const listing = await getListing(params.slug);
  if (!listing) notFound();

  const url = `${SITE_URL}/directory/${listing.slug}`;
  const jsonLd = buildJsonLd(listing, url);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DirectoryListingContent listing={listing} />
    </>
  );
}
