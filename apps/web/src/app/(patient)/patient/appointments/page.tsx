"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { patientApi } from "@/lib/patient-api-client";
import { usePatientAuth } from "@/lib/patient-auth-context";
import { formatDateTime } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

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
  const { t } = useLocale();

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
        <h1 className="text-2xl font-bold tracking-tight">{t("patientPortal.appointments.title")}</h1>
        <p className="text-muted-foreground">{t("patientPortal.appointments.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title={t("patientPortal.appointments.empty")}
          description={t("patientPortal.appointments.findFirstSuffix")}
          action={{ label: t("patientPortal.appointments.findClinicLink"), href: "/find-a-clinic" }}
        />
      ) : (
        <div className="space-y-6">
          {data.map((group) => (
            <div key={group.clinic.slug}>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{group.clinic.name}</h2>
              <div className="space-y-2">
                {group.appointments.map((appt) => (
                  <Card key={appt.id} className="surface-card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-base">
                          {t("patientPortal.clinicProfile.doctorTitle", {
                            name: `${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`,
                          })}
                        </CardTitle>
                        <CardDescription>{appt.doctor.specialization}</CardDescription>
                      </div>
                      <Badge variant={appt.status === "COMPLETED" ? "success" : "secondary"}>
                        {t(`appointmentStatus.${appt.status}`)}
                      </Badge>
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
