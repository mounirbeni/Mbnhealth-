"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarView } from "@/components/appointments/calendar-view";
import { AppointmentFormDialog } from "@/components/appointments/appointment-form-dialog";
import { useWaitlist } from "@/hooks/use-appointments";
import { useAuth } from "@/lib/auth-context";
import { formatDate, initials } from "@/lib/utils";

export default function AppointmentsPage() {
  const { hasPermission } = useAuth();
  const { data: waitlist } = useWaitlist();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground">Drag an appointment to reschedule it.</p>
        </div>
        {hasPermission("APPOINTMENTS_WRITE") && <AppointmentFormDialog />}
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist ({waitlist?.length ?? 0})</TabsTrigger>
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
                        {w.doctor ? `Dr. ${w.doctor.user.firstName} ${w.doctor.user.lastName}` : "Any doctor"} ·{" "}
                        {w.preferredDate ? formatDate(w.preferredDate) : "No preferred date"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-sm text-muted-foreground">No patients on the waitlist.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
