"use client";

import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { formatDateTime, initials } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import type { Appointment } from "@/types";

const NEXT_ACTIONS: Record<string, { label: string; status: string; variant?: "default" | "destructive" }[]> = {
  CONFIRMED: [
    { label: "Check in", status: "CHECKED_IN" },
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
    { label: "No-show", status: "NO_SHOW", variant: "destructive" },
  ],
  WAITING: [
    { label: "Check in", status: "CHECKED_IN" },
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
  CHECKED_IN: [
    { label: "Start consultation", status: "IN_CONSULTATION" },
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
  IN_CONSULTATION: [{ label: "Complete", status: "COMPLETED" }],
  EMERGENCY: [{ label: "Start consultation", status: "IN_CONSULTATION" }, { label: "Complete", status: "COMPLETED" }],
  COMPLETED: [],
  CANCELLED: [{ label: "Reinstate", status: "CONFIRMED" }],
  NO_SHOW: [{ label: "Reinstate", status: "CONFIRMED" }],
};

export function AppointmentDetailSheet({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const updateStatus = useUpdateAppointmentStatus();

  const actions = NEXT_ACTIONS[appointment.status] ?? [];

  const handleAction = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ id: appointment.id, status });
      toast.success(`Appointment marked ${status.replace("_", " ").toLowerCase()}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update status");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Appointment details</DialogTitle>
        </DialogHeader>
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
            <Badge variant={STATUS_BADGE_VARIANT[appointment.status] ?? "secondary"} className="ml-auto">
              {appointment.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Doctor</p>
              <p className="font-medium">
                Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{appointment.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Start</p>
              <p className="font-medium">{formatDateTime(appointment.startTime)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End</p>
              <p className="font-medium">{formatDateTime(appointment.endTime)}</p>
            </div>
          </div>
          {appointment.reason && (
            <div>
              <p className="text-sm text-muted-foreground">Reason</p>
              <p className="text-sm">{appointment.reason}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {actions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant ?? "default"}
              onClick={() => handleAction(action.status)}
              disabled={updateStatus.isPending}
            >
              {action.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
