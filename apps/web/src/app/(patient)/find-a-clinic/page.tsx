"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, Search, SearchX, Stethoscope, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClinicLogo } from "@/components/patient/clinic-logo";
import { patientApi } from "@/lib/patient-api-client";

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

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [specialty, setSpecialty] = useState(searchParams.get("specialty") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const debouncedQuery = useDebounced(query, 300);

  // Keep the URL shareable/back-button-friendly without spamming history entries.
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("query", debouncedQuery);
    if (specialty) params.set("specialty", specialty);
    if (city) params.set("city", city);
    const qs = params.toString();
    router.replace(qs ? `/find-a-clinic?${qs}` : "/find-a-clinic", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, specialty, city]);

  const { data: filters } = useQuery({
    queryKey: ["clinic-filters"],
    queryFn: () => patientApi.get<Filters>("/public/clinics/filters", { skipAuth: true }),
    staleTime: 5 * 60 * 1000,
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
  });

  const hasActiveFilters = Boolean(query || specialty || city);
  const clearFilters = () => {
    setQuery("");
    setSpecialty("");
    setCity("");
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Find the right clinic, book in seconds</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Search clinics by name, city, or specialty — see real availability and confirm your appointment instantly.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="bg-background pl-9"
              placeholder="Clinic name or address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Select value={city || ANY} onValueChange={(v) => setCity(v === ANY ? "" : v)}>
            <SelectTrigger className="bg-background">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Any city" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any city</SelectItem>
              {filters?.cities.map((c) => (
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
                <SelectValue placeholder="Any specialty" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any specialty</SelectItem>
              {filters?.specialties.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!!filters?.specialties.length && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {filters.specialties.slice(0, 6).map((s) => (
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
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Searching..." : `${data?.length ?? 0} clinic${data?.length === 1 ? "" : "s"} found`}
          {isFetching && !isLoading && <span className="ml-1 text-muted-foreground/60">· updating…</span>}
        </p>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ClinicCardSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <SearchX className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No clinics match your search</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a different city or specialty, or clear your filters to see every clinic.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {data.map((clinic) => (
            <Link key={clinic.slug} href={`/clinics/${clinic.slug}`} className="group block h-full">
              <Card className="h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg">
                <div className="h-1.5" style={{ backgroundColor: clinic.primaryColor ?? "#0EA5E9" }} />
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3.5">
                    <ClinicLogo logoUrl={clinic.logoUrl} name={clinic.name} color={clinic.primaryColor} />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-lg group-hover:text-primary">{clinic.name}</CardTitle>
                      {(clinic.address || clinic.city) && (
                        <CardDescription className="mt-0.5 flex items-start gap-1.5">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-1">{clinic.address ?? clinic.city}</span>
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {clinic.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {clinic.specialties.slice(0, 4).map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                      {clinic.specialties.length > 4 && (
                        <Badge variant="outline">+{clinic.specialties.length - 4} more</Badge>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {clinic.doctorCount} doctor{clinic.doctorCount === 1 ? "" : "s"}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-80 transition-opacity group-hover:opacity-100">
                      View clinic <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
