"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarView } from "@/components/appointments/calendar-view";
import { AppointmentFormDialog } from "@/components/appointments/appointment-form-dialog";
import { ReceptionQueue } from "@/components/appointments/reception-queue";
import { useWaitlist } from "@/hooks/use-appointments";
import { useAuth } from "@/lib/auth-context";
import { formatDate, initials } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

export default function AppointmentsPage() {
  const { hasPermission } = useAuth();
  const { data: waitlist } = useWaitlist();
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title">{t("dashboard.appointments.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.appointments.subtitle")}</p>
        </div>
        {hasPermission("APPOINTMENTS_WRITE") && <AppointmentFormDialog />}
      </div>

      <ReceptionQueue />

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">{t("dashboard.appointments.calendarTab")}</TabsTrigger>
          <TabsTrigger value="waitlist">
            {t("dashboard.appointments.waitlistTab", { count: waitlist?.length ?? 0 })}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <CalendarView />
        </TabsContent>
        <TabsContent value="waitlist">
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {waitlist && waitlist.length > 0 ? (
                waitlist.map((w) => (
                  <div key={w.id} className="flex items-center gap-3 p-4">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initials(w.patient.firstName, w.patient.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {w.patient.firstName} {w.patient.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {w.doctor
                          ? t("patientPortal.clinicProfile.doctorTitle", {
                              name: `${w.doctor.user.firstName} ${w.doctor.user.lastName}`,
                            })
                          : t("dashboard.appointments.anyDoctor")}{" "}
                        · {w.preferredDate ? formatDate(w.preferredDate) : t("dashboard.appointments.noPreferredDate")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {t("dashboard.appointments.emptyWaitlist")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
