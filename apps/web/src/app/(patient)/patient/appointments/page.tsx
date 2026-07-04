"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { patientApi } from "@/lib/patient-api-client";
import { usePatientAuth } from "@/lib/patient-auth-context";
import { formatDateTime } from "@/lib/utils";

interface ClinicBookings {
  clinic: { name: string; slug: string; logoUrl: string | null };
  appointments: {
    id: string;
    status: string;
    type: string;
    startTime: string;
    endTime: string;
    reason: string | null;
    doctor: { specialization: string; user: { firstName: string; lastName: string } };
  }[];
}

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { patient, isLoading: authLoading } = usePatientAuth();

  useEffect(() => {
    if (!authLoading && !patient) router.replace("/patient/login?next=/patient/appointments");
  }, [authLoading, patient, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => patientApi.get<ClinicBookings[]>("/public/bookings/mine"),
    enabled: !!patient,
  });

  if (authLoading || !patient) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My appointments</h1>
        <p className="text-muted-foreground">Across every clinic you&apos;ve booked with.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No appointments yet.{" "}
          <Link href="/find-a-clinic" className="text-primary hover:underline">
            Find a clinic
          </Link>{" "}
          to book your first one.
        </p>
      ) : (
        <div className="space-y-6">
          {data.map((group) => (
            <div key={group.clinic.slug}>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{group.clinic.name}</h2>
              <div className="space-y-2">
                {group.appointments.map((appt) => (
                  <Card key={appt.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-base">
                          Dr. {appt.doctor.user.firstName} {appt.doctor.user.lastName}
                        </CardTitle>
                        <CardDescription>{appt.doctor.specialization}</CardDescription>
                      </div>
                      <Badge variant={appt.status === "COMPLETED" ? "success" : "secondary"}>{appt.status}</Badge>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {formatDateTime(appt.startTime)}
                      {appt.reason ? ` · ${appt.reason}` : ""}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
