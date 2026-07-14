"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { formatDateTime, initials } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Appointment } from "@/types";

const QUEUE_STATUSES = new Set(["WAITING", "CHECKED_IN"]);
const NEXT_STATUS: Record<string, string> = {
  WAITING: "CHECKED_IN",
  CHECKED_IN: "IN_CONSULTATION",
};

export function ReceptionQueue() {
  const { t } = useLocale();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const updateStatus = useUpdateAppointmentStatus();

  const { from, to } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }, []);

  const { data: appointments, isLoading } = useAppointments({ from, to });

  const queue = (appointments ?? [])
    .filter((a) => QUEUE_STATUSES.has(a.status))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const advance = async (appointment: Appointment) => {
    const nextStatus = NEXT_STATUS[appointment.status];
    if (!nextStatus) return;
    setPendingId(appointment.id);
    try {
      await updateStatus.mutateAsync({ id: appointment.id, status: nextStatus });
      toast.success(t("dashboard.appointments.detail.statusUpdated", { status: t(`appointmentStatus.${nextStatus}`) }));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("dashboard.appointments.detail.updateFailed"));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-section-title">{t("dashboard.appointments.queue.title")}</h2>
      {isLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-56 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          {t("dashboard.appointments.queue.empty")}
        </p>
      ) : (
        <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2">
          {queue.map((appointment) => (
            <Card
              key={appointment.id}
              className="surface-card-hover w-56 shrink-0 animate-fade-in-up p-3"
            >
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback>{initials(appointment.patient.firstName, appointment.patient.lastName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    {formatDateTime(appointment.startTime)}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <Badge variant={STATUS_BADGE_VARIANT[appointment.status] ?? "secondary"}>
                  {t(`appointmentStatus.${appointment.status}`)}
                </Badge>
                {NEXT_STATUS[appointment.status] && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    disabled={pendingId === appointment.id}
                    onClick={() => advance(appointment)}
                  >
                    {appointment.status === "WAITING"
                      ? t("dashboard.appointments.detail.checkIn")
                      : t("dashboard.appointments.detail.startConsultation")}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
