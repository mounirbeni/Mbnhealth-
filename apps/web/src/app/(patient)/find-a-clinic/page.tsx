"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Search, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { patientApi } from "@/lib/patient-api-client";

interface ClinicSearchResult {
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  doctorCount: number;
  specialties: string[];
}

export default function FindClinicPage() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["clinic-search", query, specialty],
    queryFn: () =>
      patientApi.get<ClinicSearchResult[]>(
        `/public/clinics?${new URLSearchParams({ ...(query ? { query } : {}), ...(specialty ? { specialty } : {}) })}`,
        { skipAuth: true },
      ),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Find a clinic</h1>
        <p className="text-muted-foreground">Search by clinic name, address, or specialty, then book instantly.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Clinic name or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Specialty (e.g. Cardiology)..."
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Searching...</p>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No clinics found. Try a different search.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((clinic) => (
            <Link key={clinic.slug} href={`/clinics/${clinic.slug}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: clinic.primaryColor ?? "#0EA5E9" }}
                    >
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{clinic.name}</CardTitle>
                      {clinic.address && (
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {clinic.address}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {clinic.specialties.slice(0, 4).map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {clinic.doctorCount} doctor{clinic.doctorCount === 1 ? "" : "s"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
