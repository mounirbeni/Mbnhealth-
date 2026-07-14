"use client";

import Link from "next/link";
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
import { useLocale } from "@/lib/i18n/locale-context";
import type { ListingCard, ListingDetail } from "./types";

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function ListingCardMini({ clinic }: { clinic: ListingCard }) {
  return (
    <Link href={`/directory/${clinic.slug}`} className="block h-full">
      <Card className="surface-card surface-card-hover h-full">
        <CardHeader className="pb-2">
          <CardTitle className="truncate text-sm">{clinic.name}</CardTitle>
          {clinic.address && <p className="line-clamp-1 text-xs text-muted-foreground">{clinic.address}</p>}
        </CardHeader>
        <CardContent className="space-y-1.5 pb-3 pt-0">
          {clinic.specialties.length > 0 && (
            <Badge variant="secondary" className="text-[11px]">
              {clinic.specialties[0]}
            </Badge>
          )}
          <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className={clinic.rating ? "h-3 w-3 fill-warning text-warning" : "h-3 w-3 text-muted-foreground/40"} />
              {clinic.rating ?? "—"}
            </span>
            {clinic.doctorsCount > 0 && (
              <span className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" /> {clinic.doctorsCount}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function DirectoryListingContent({ listing }: { listing: ListingDetail }) {
  const { t } = useLocale();

  const hoursEntries = listing.openingHours
    ? DAY_ORDER.filter((d) => listing.openingHours![d]).map((d) => ({ day: d, hours: listing.openingHours![d] }))
    : [];

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/find-a-clinic" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("patientPortal.nav.findClinic")}
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
                  {listing.isOnPlatform
                    ? t("patientPortal.directory.badgeOnPlatform")
                    : t("patientPortal.directory.badgeOffPlatform")}
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
                <span className="flex items-center gap-1.5">
                  <Star
                    className={listing.rating ? "h-3.5 w-3.5 fill-warning text-warning" : "h-3.5 w-3.5 text-muted-foreground/40"}
                  />
                  {listing.rating
                    ? `${listing.rating} ${listing.reviewCount ? `(${listing.reviewCount})` : ""}`
                    : t("patientPortal.directory.notYetRated")}
                </span>
                {listing.doctors.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" />
                    {t(
                      listing.doctors.length === 1 ? "patientPortal.findClinic.doctorCount" : "patientPortal.findClinic.doctorsCount",
                      { count: listing.doctors.length },
                    )}
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
            <h2 className="mb-3 text-lg font-semibold">{t("patientPortal.directory.aboutTitle")}</h2>
            {listing.aboutText ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{listing.aboutText}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{t("patientPortal.directory.aboutUnknown")}</p>
            )}
          </section>

          {/* Doctors */}
          {listing.doctors.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">{t("patientPortal.directory.doctorsTitle")}</h2>
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
                <Stethoscope className="h-4.5 w-4.5 text-primary" /> {t("patientPortal.directory.servicesTitle")}
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
              <Clock className="h-4.5 w-4.5 text-primary" /> {t("patientPortal.directory.hoursTitle")}
            </h2>
            {hoursEntries.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-border">
                {hoursEntries.map(({ day, hours }) => (
                  <div key={day} className="flex justify-between border-b border-border/60 px-4 py-2 text-sm last:border-b-0">
                    <span className="text-muted-foreground">{t(`patientPortal.directory.days.${day}`)}</span>
                    <span>
                      {hours[0]} – {hours[1]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("patientPortal.directory.hoursUnknown")}</p>
            )}
          </section>

          {/* Map */}
          {listing.latitude && listing.longitude && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">{t("patientPortal.directory.mapTitle")}</h2>
              <div className="overflow-hidden rounded-xl border border-border">
                <iframe
                  title={t("patientPortal.directory.mapAlt", { name: listing.name })}
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
                  {t("patientPortal.directory.openInMaps")}
                </a>
              )}
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 className="mb-3 text-lg font-semibold">{t("patientPortal.directory.reviewsTitle")}</h2>
            {listing.rating ? (
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-medium">{t("patientPortal.directory.ratingOutOfFive", { rating: listing.rating })}</span>
                {listing.reviewCount && (
                  <span className="text-muted-foreground">
                    {t("patientPortal.directory.reviewCountLabel", { count: listing.reviewCount })}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("patientPortal.directory.noReviews")}</p>
            )}
          </section>

          {/* FAQ */}
          {listing.faqs.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">{t("patientPortal.directory.faqTitle")}</h2>
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
              <h2 className="mb-3 text-lg font-semibold">{t("patientPortal.directory.nearbyTitle")}</h2>
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
              <CardTitle className="text-base">{t("patientPortal.directory.requestAppointment")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestAppointmentForm slug={listing.slug} />
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("patientPortal.directory.contactTitle")}</CardTitle>
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
                  ? t("patientPortal.directory.insuranceUnknown")
                  : listing.acceptsInsurance
                    ? t("patientPortal.directory.insuranceYes")
                    : t("patientPortal.directory.insuranceNo")}
              </span>
              {(listing.consultationPriceMinMad || listing.consultationPriceMaxMad) && (
                <p className="text-muted-foreground">
                  {t("patientPortal.directory.priceTitle")}:{" "}
                  {listing.consultationPriceMinMad === listing.consultationPriceMaxMad
                    ? `${listing.consultationPriceMinMad} MAD`
                    : `${listing.consultationPriceMinMad ?? "?"}–${listing.consultationPriceMaxMad ?? "?"} MAD`}
                </p>
              )}
              {listing.sourceUrl && (
                <p className="border-t border-border/60 pt-2 text-xs text-muted-foreground">
                  {t("patientPortal.directory.sourceLabel")}:{" "}
                  <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    {t("patientPortal.directory.sourceListingLinkText")}
                  </a>
                  {listing.verifiedAt &&
                    ` · ${t("patientPortal.directory.verifiedOn", { date: new Date(listing.verifiedAt).toLocaleDateString() })}`}
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
