"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { patientApi } from "@/lib/patient-api-client";

interface ClinicProfile {
  slug: string;
  name: string;
  address: string | null;
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

export default function ClinicProfilePage({ params }: { params: { slug: string } }) {
  const { data: clinic, isLoading } = useQuery({
    queryKey: ["clinic-profile", params.slug],
    queryFn: () => patientApi.get<ClinicProfile>(`/public/clinics/${params.slug}`, { skipAuth: true }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading clinic...</p>;
  if (!clinic) return <p className="text-sm text-muted-foreground">Clinic not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{clinic.name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {clinic.address && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {clinic.address}
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
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Doctors</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {clinic.doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {doctor.firstName[0]}
                      {doctor.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </CardTitle>
                    <CardDescription>
                      {doctor.specialization}
                      {doctor.department ? ` · ${doctor.department.name}` : ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {doctor.consultationFee ? `${doctor.consultationFee} MAD / visit` : "Consultation fee on request"}
                </span>
                <Button size="sm" asChild>
                  <Link href={`/clinics/${clinic.slug}/book/${doctor.id}`}>Book</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          {clinic.doctors.length === 0 && (
            <p className="text-sm text-muted-foreground">This clinic hasn&apos;t listed any doctors yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
