"use client";

import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { formatDateTime, initials } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Appointment } from "@/types";

export function AppointmentDetailSheet({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const updateStatus = useUpdateAppointmentStatus();
  const { t } = useLocale();

  const NEXT_ACTIONS: Record<string, { labelKey: string; status: string; variant?: "default" | "destructive" }[]> = {
    CONFIRMED: [
      { labelKey: "checkIn", status: "CHECKED_IN" },
      { labelKey: "cancel", status: "CANCELLED", variant: "destructive" },
      { labelKey: "noShow", status: "NO_SHOW", variant: "destructive" },
    ],
    WAITING: [
      { labelKey: "checkIn", status: "CHECKED_IN" },
      { labelKey: "cancel", status: "CANCELLED", variant: "destructive" },
    ],
    CHECKED_IN: [
      { labelKey: "startConsultation", status: "IN_CONSULTATION" },
      { labelKey: "cancel", status: "CANCELLED", variant: "destructive" },
    ],
    IN_CONSULTATION: [{ labelKey: "complete", status: "COMPLETED" }],
    EMERGENCY: [
      { labelKey: "startConsultation", status: "IN_CONSULTATION" },
      { labelKey: "complete", status: "COMPLETED" },
    ],
    COMPLETED: [],
    CANCELLED: [{ labelKey: "reinstate", status: "CONFIRMED" }],
    NO_SHOW: [{ labelKey: "reinstate", status: "CONFIRMED" }],
  };

  const actions = NEXT_ACTIONS[appointment.status] ?? [];

  const handleAction = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ id: appointment.id, status });
      toast.success(t("dashboard.appointments.detail.statusUpdated", { status: t(`appointmentStatus.${status}`) }));
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("dashboard.appointments.detail.updateFailed"));
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="end">
        <SheetHeader>
          <SheetTitle>{t("dashboard.appointments.detail.title")}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials(appointment.patient.firstName, appointment.patient.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{appointment.patient.phone}</p>
            </div>
            <Badge variant={STATUS_BADGE_VARIANT[appointment.status] ?? "secondary"} className="ms-auto">
              {t(`appointmentStatus.${appointment.status}`)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">{t("dashboard.appointments.detail.doctor")}</p>
              <p className="font-medium">
                Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("dashboard.appointments.detail.type")}</p>
              <p className="font-medium">{appointment.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("dashboard.appointments.detail.start")}</p>
              <p className="font-medium">{formatDateTime(appointment.startTime)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("dashboard.appointments.detail.end")}</p>
              <p className="font-medium">{formatDateTime(appointment.endTime)}</p>
            </div>
          </div>
          {appointment.reason && (
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.appointments.detail.reason")}</p>
              <p className="text-sm">{appointment.reason}</p>
            </div>
          )}
        </div>
        <SheetFooter>
          {actions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant ?? "default"}
              onClick={() => handleAction(action.status)}
              disabled={updateStatus.isPending}
            >
              {t(`dashboard.appointments.detail.${action.labelKey}`)}
            </Button>
          ))}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
