import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Clock,
  Globe,
  Languages,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShareSaveBar, RequestAppointmentForm } from "./listing-actions";

export const revalidate = 3600; // directory data changes rarely — safe to cache and revalidate hourly

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.mbnhealth.com";

const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

interface ListingCard {
  slug: string;
  name: string;
  specialties: string[];
  city: string;
  neighborhood: string | null;
  address: string | null;
  phone: string | null;
  rating: string | null;
  reviewCount: number | null;
  wheelchairAccessible: boolean | null;
  acceptsInsurance: boolean | null;
  openNow: boolean | null;
  coverPhotoUrl: string | null;
  isOnPlatform: boolean;
}

interface ListingDetail extends ListingCard {
  id: string;
  latitude: string | null;
  longitude: string | null;
  googleMapsUrl: string | null;
  email: string | null;
  website: string | null;
  openingHours: Record<string, [string, string]> | null;
  languages: string[];
  consultationPriceMinMad: string | null;
  consultationPriceMaxMad: string | null;
  aboutText: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
  photos: { url: string; caption: string | null }[];
  doctors: {
    id: string;
    name: string;
    specialty: string | null;
    languages: string[];
    bio: string | null;
    qualifications: string | null;
    experienceText: string | null;
    consultationHours: string | null;
    photoUrl: string | null;
  }[];
  faqs: { id: string; question: string; answer: string }[];
  nearby: ListingCard[];
}

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
    ...(listing.address ? { address: { "@type": "PostalAddress", streetAddress: listing.address, addressLocality: listing.city, addressCountry: "MA" } } : { address: { "@type": "PostalAddress", addressLocality: listing.city, addressCountry: "MA" } }),
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

function ListingCardMini({ clinic }: { clinic: ListingCard }) {
  return (
    <Link href={`/directory/${clinic.slug}`} className="block h-full">
      <Card className="surface-card surface-card-hover h-full">
        <CardHeader className="pb-2">
          <CardTitle className="truncate text-sm">{clinic.name}</CardTitle>
          {clinic.address && <p className="line-clamp-1 text-xs text-muted-foreground">{clinic.address}</p>}
        </CardHeader>
        <CardContent className="pb-3 pt-0">
          {clinic.specialties.length > 0 && (
            <Badge variant="secondary" className="text-[11px]">
              {clinic.specialties[0]}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function DirectoryListingPage({ params }: { params: { slug: string } }) {
  const listing = await getListing(params.slug);
  if (!listing) notFound();

  const url = `${SITE_URL}/directory/${listing.slug}`;
  const jsonLd = buildJsonLd(listing, url);
  const hoursEntries = listing.openingHours
    ? DAY_ORDER.filter((d) => listing.openingHours![d]).map((d) => ({ day: d, hours: listing.openingHours![d] }))
    : [];

  return (
    <div className="space-y-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/find-a-clinic" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> Find a Clinic
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{listing.name}</span>
      </nav>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-border bg-grid-fade">
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={listing.isOnPlatform ? "default" : "outline"}>
                  {listing.isOnPlatform ? "Book online" : "Not yet on MBN Health"}
                </Badge>
                {listing.specialties.slice(0, 3).map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{listing.name}</h1>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {(listing.address || listing.city) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {listing.address ?? listing.city}
                  </span>
                )}
                {listing.phone && (
                  <a href={`tel:${listing.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                    <Phone className="h-3.5 w-3.5" /> {listing.phone}
                  </a>
                )}
                {listing.rating && (
                  <span className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {listing.rating} {listing.reviewCount ? `(${listing.reviewCount})` : ""}
                  </span>
                )}
              </div>
            </div>
            <ShareSaveBar slug={listing.slug} name={listing.name} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* About */}
          <section>
            <h2 className="mb-3 text-lg font-semibold">About this clinic</h2>
            {listing.aboutText ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{listing.aboutText}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No description published yet for this clinic. Contact details below are sourced from a public
                medical directory — call ahead to confirm before visiting.
              </p>
            )}
          </section>

          {/* Doctors */}
          {listing.doctors.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Doctors</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {listing.doctors.map((doctor) => (
                  <Card key={doctor.id} className="surface-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{doctor.name}</CardTitle>
                      {doctor.specialty && <p className="text-sm text-muted-foreground">{doctor.specialty}</p>}
                    </CardHeader>
                    {(doctor.bio || doctor.qualifications || doctor.experienceText) && (
                      <CardContent className="space-y-1 pt-0 text-sm text-muted-foreground">
                        {doctor.bio && <p>{doctor.bio}</p>}
                        {doctor.qualifications && <p>{doctor.qualifications}</p>}
                        {doctor.experienceText && <p>{doctor.experienceText}</p>}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Services / specialties */}
          {listing.specialties.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Stethoscope className="h-4.5 w-4.5 text-primary" /> Specialties
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.specialties.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Hours */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-4.5 w-4.5 text-primary" /> Opening hours
            </h2>
            {hoursEntries.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-border">
                {hoursEntries.map(({ day, hours }) => (
                  <div key={day} className="flex justify-between border-b border-border/60 px-4 py-2 text-sm last:border-b-0">
                    <span className="text-muted-foreground">{DAY_LABELS[day]}</span>
                    <span>
                      {hours[0]} – {hours[1]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Hours not published yet — call to confirm.</p>
            )}
          </section>

          {/* Map */}
          {listing.latitude && listing.longitude && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Location</h2>
              <div className="overflow-hidden rounded-xl border border-border">
                <iframe
                  title={`Map for ${listing.name}`}
                  className="h-72 w-full"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}&output=embed`}
                />
              </div>
              {listing.googleMapsUrl && (
                <a
                  href={listing.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Open in Google Maps
                </a>
              )}
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 className="mb-3 text-lg font-semibold">Reviews</h2>
            {listing.rating ? (
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-medium">{listing.rating} / 5</span>
                {listing.reviewCount && <span className="text-muted-foreground">({listing.reviewCount} reviews)</span>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No review data available yet.</p>
            )}
          </section>

          {/* FAQ */}
          {listing.faqs.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Frequently asked questions</h2>
              <div className="space-y-3">
                {listing.faqs.map((faq) => (
                  <div key={faq.id} className="rounded-lg border border-border p-4">
                    <p className="font-medium">{faq.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nearby */}
          {listing.nearby.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Nearby clinics</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {listing.nearby.map((n) => (
                  <ListingCardMini key={n.slug} clinic={n} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card className="surface-card sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Request an appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestAppointmentForm slug={listing.slug} />
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contact & details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {listing.email && (
                <a href={`mailto:${listing.email}`} className="flex items-center gap-2 hover:text-primary">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {listing.email}
                </a>
              )}
              {listing.website && (
                <a href={listing.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" /> {listing.website}
                </a>
              )}
              {listing.languages.length > 0 && (
                <span className="flex items-center gap-2">
                  <Languages className="h-3.5 w-3.5 text-muted-foreground" /> {listing.languages.join(", ")}
                </span>
              )}
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                {listing.acceptsInsurance == null
                  ? "Insurance info not available"
                  : listing.acceptsInsurance
                    ? "Accepts insurance"
                    : "Does not accept insurance"}
              </span>
              {(listing.consultationPriceMinMad || listing.consultationPriceMaxMad) && (
                <p className="text-muted-foreground">
                  Consultation:{" "}
                  {listing.consultationPriceMinMad === listing.consultationPriceMaxMad
                    ? `${listing.consultationPriceMinMad} MAD`
                    : `${listing.consultationPriceMinMad ?? "?"}–${listing.consultationPriceMaxMad ?? "?"} MAD`}
                </p>
              )}
              {listing.sourceUrl && (
                <p className="border-t border-border/60 pt-2 text-xs text-muted-foreground">
                  Source:{" "}
                  <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    public directory listing
                  </a>
                  {listing.verifiedAt && ` · verified ${new Date(listing.verifiedAt).toLocaleDateString()}`}
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
