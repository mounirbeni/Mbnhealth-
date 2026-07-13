"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Search,
  SearchX,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicLogo } from "@/components/patient/clinic-logo";
import { patientApi } from "@/lib/patient-api-client";
import { useLocale } from "@/lib/i18n/locale-context";

interface ClinicSearchResult {
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  doctorCount: number;
  specialties: string[];
}

interface Filters {
  cities: string[];
  specialties: string[];
}

interface DirectoryListingCard {
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

const ANY = "__any__";

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function ClinicCardSkeleton() {
  return (
    <Card className="animate-pulse overflow-hidden">
      <div className="h-1.5 bg-muted" />
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function FindClinicPage() {
  return (
    <Suspense fallback={null}>
      <FindClinicContent />
    </Suspense>
  );
}

function FindClinicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [specialty, setSpecialty] = useState(searchParams.get("specialty") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const debouncedQuery = useDebounced(query, 300);

  // "platform" = MBN Health tenant clinics (existing, bookable in real time).
  // "all" = the Morocco-wide directory of independently sourced real clinics,
  // most of which aren't MBN Health customers — see ClinicListing.
  const [tab, setTab] = useState<"platform" | "all">((searchParams.get("tab") as "platform" | "all") ?? "platform");
  const [openNow, setOpenNow] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [acceptsInsurance, setAcceptsInsurance] = useState(false);
  const [sort, setSort] = useState<"rating" | "reviews" | "name">("name");

  // Keep the URL shareable/back-button-friendly without spamming history entries.
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("query", debouncedQuery);
    if (specialty) params.set("specialty", specialty);
    if (city) params.set("city", city);
    if (tab !== "platform") params.set("tab", tab);
    const qs = params.toString();
    router.replace(qs ? `/find-a-clinic?${qs}` : "/find-a-clinic", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, specialty, city, tab]);

  const { data: filters } = useQuery({
    queryKey: ["clinic-filters"],
    queryFn: () => patientApi.get<Filters>("/public/clinics/filters", { skipAuth: true }),
    staleTime: 5 * 60 * 1000,
    enabled: tab === "platform",
  });

  const { data: directoryFilters } = useQuery({
    queryKey: ["directory-filters"],
    queryFn: () => patientApi.get<Filters>("/public/directory/filters", { skipAuth: true }),
    staleTime: 5 * 60 * 1000,
    enabled: tab === "all",
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["clinic-search", debouncedQuery, specialty, city],
    queryFn: () =>
      patientApi.get<ClinicSearchResult[]>(
        `/public/clinics?${new URLSearchParams({
          ...(debouncedQuery ? { query: debouncedQuery } : {}),
          ...(specialty ? { specialty } : {}),
          ...(city ? { city } : {}),
        })}`,
        { skipAuth: true },
      ),
    enabled: tab === "platform",
  });

  const {
    data: directoryData,
    isLoading: directoryLoading,
    isFetching: directoryFetching,
  } = useQuery({
    queryKey: ["directory-search", debouncedQuery, specialty, city, openNow, wheelchairAccessible, acceptsInsurance, sort],
    queryFn: () =>
      patientApi.get<DirectoryListingCard[]>(
        `/public/directory?${new URLSearchParams({
          ...(debouncedQuery ? { query: debouncedQuery } : {}),
          ...(specialty ? { specialty } : {}),
          ...(city ? { city } : {}),
          ...(openNow ? { openNow: "true" } : {}),
          ...(wheelchairAccessible ? { wheelchairAccessible: "true" } : {}),
          ...(acceptsInsurance ? { acceptsInsurance: "true" } : {}),
          sort,
        })}`,
        { skipAuth: true },
      ),
    enabled: tab === "all",
  });

  const activeFilters = tab === "platform" ? filters : directoryFilters;
  const hasActiveFilters = Boolean(
    query || specialty || city || (tab === "all" && (openNow || wheelchairAccessible || acceptsInsurance)),
  );
  const clearFilters = () => {
    setQuery("");
    setSpecialty("");
    setCity("");
    setOpenNow(false);
    setWheelchairAccessible(false);
    setAcceptsInsurance(false);
    setSort("name");
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("patientPortal.findClinic.heroTitle")}</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">{t("patientPortal.findClinic.heroSubtitle")}</p>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "platform" | "all")} className="mt-5">
          <TabsList>
            <TabsTrigger value="platform">{t("patientPortal.directory.tabPlatform")}</TabsTrigger>
            <TabsTrigger value="all">{t("patientPortal.directory.tabAll")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
            <Input
              className="bg-background pl-9 rtl:pl-3 rtl:pr-9"
              placeholder={t("patientPortal.findClinic.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Select value={city || ANY} onValueChange={(v) => setCity(v === ANY ? "" : v)}>
            <SelectTrigger className="bg-background">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder={t("patientPortal.findClinic.anyCity")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t("patientPortal.findClinic.anyCity")}</SelectItem>
              {activeFilters?.cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={specialty || ANY} onValueChange={(v) => setSpecialty(v === ANY ? "" : v)}>
            <SelectTrigger className="bg-background">
              <div className="flex items-center gap-2 truncate">
                <Stethoscope className="h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder={t("patientPortal.findClinic.anySpecialty")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t("patientPortal.findClinic.anySpecialty")}</SelectItem>
              {activeFilters?.specialties.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!!activeFilters?.specialties.length && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {activeFilters.specialties.slice(0, 6).map((s) => (
              <button
                key={s}
                onClick={() => setSpecialty(specialty === s ? "" : s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  specialty === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {tab === "all" && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <button
              onClick={() => setOpenNow((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                openNow
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" /> {t("patientPortal.directory.filterOpenNow")}
            </button>
            <button
              onClick={() => setWheelchairAccessible((v) => !v)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                wheelchairAccessible
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {t("patientPortal.directory.filterWheelchairAccessible")}
            </button>
            <button
              onClick={() => setAcceptsInsurance((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                acceptsInsurance
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> {t("patientPortal.directory.filterAcceptsInsurance")}
            </button>
  