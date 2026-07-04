"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CalendarCheck, Globe, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClinicLogo } from "@/components/patient/clinic-logo";
import { patientApi } from "@/lib/patient-api-client";

interface ClinicProfile {
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  departments: { id: string; name: string; color: string | null }[];
  doctors: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    specialization: string;
    bio: string | null;
    consultationFee: string | null;
    department: { id: string; name: string } | null;
  }[];
}

function DoctorCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-full rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export default function ClinicProfilePage({ params }: { params: { slug: string } }) {
  const { data: clinic, isLoading } = useQuery({
    queryKey: ["clinic-profile", params.slug],
    queryFn: () => patientApi.get<ClinicProfile>(`/public/clinics/${params.slug}`, { skipAuth: true }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-medium">Clinic not found</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/find-a-clinic">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to search
          </Link>
        </Button>
      </div>
    );
  }

  const accent = clinic.primaryColor ?? "#0EA5E9";

  return (
    <div className="space-y-8">
      <Link href="/find-a-clinic" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to search
      </Link>

      {/* Header */}
      <div
        className="overflow-hidden rounded-2xl border border-border"
        style={{ background: `linear-gradient(135deg, ${accent}22, transparent 70%)` }}
      >
        <div className="h-2" style={{ backgroundColor: accent }} />
        <div className="flex flex-wrap items-start gap-4 p-6 sm:p-8">
          <ClinicLogo logoUrl={clinic.logoUrl} name={clinic.name} color={clinic.primaryColor} size={72} rounded="2xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{clinic.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {(clinic.address || clinic.city) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {clinic.address ?? clinic.city}
                </span>
              )}
              {clinic.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {clinic.phone}
                </span>
              )}
              {clinic.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {clinic.email}
                </span>
              )}
              {clinic.website && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> {clinic.website}
                </span>
              )}
            </div>
            {clinic.departments.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {clinic.departments.map((dept) => (
                  <Badge key={dept.id} variant="secondary" style={dept.color ? { color: dept.color } : undefined}>
                    {dept.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctors */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <CalendarCheck className="h-4.5 w-4.5 text-primary" />
          Book an appointment
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {clinic.doctors.map((doctor) => {
            // The department can legitimately share its name with the doctor's
            // specialization (e.g. an "Orthopedics" doctor in the "Orthopedics"
            // department) — showing both then would just repeat the same word.
            const showDepartment =
              doctor.department && doctor.department.name.toLowerCase() !== doctor.specialization.toLowerCase();

            return (
              <Card key={doctor.id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {doctor.avatarUrl && <AvatarImage src={doctor.avatarUrl} alt="" />}
                      <AvatarFallback className="text-sm font-semibold" style={{ backgroundColor: `${accent}26`, color: accent }}>
                        {doctor.firstName[0]}
                        {doctor.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {doctor.specialization}
                        {showDepartment ? ` · ${doctor.department!.name}` : ""}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  {doctor.bio && <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{doctor.bio}</p>}
                  <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                    <span className="text-sm font-medium text-foreground">
                      {doctor.consultationFee ? `${doctor.consultationFee} MAD / visit` : "Fee on request"}
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/clinics/${clinic.slug}/book/${doctor.id}`}>
                        Book <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {clinic.doctors.length === 0 && (
            <p className="text-sm text-muted-foreground">This clinic hasn&apos;t listed any doctors yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
