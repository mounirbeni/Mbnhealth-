"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientCombobox } from "@/components/patients/patient-combobox";
import { useDoctors } from "@/hooks/use-doctors";
import { useCreateAppointment } from "@/hooks/use-appointments";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

interface FormValues {
  patientId: string;
  doctorId: string;
  type: string;
  date: string;
  time: string;
  durationMinutes: string;
  reason: string;
}

const APPOINTMENT_TYPES = ["CONSULTATION", "FOLLOW_UP", "PROCEDURE", "CHECKUP", "EMERGENCY", "TELEHEALTH"];

export function AppointmentFormDialog({ defaultDate }: { defaultDate?: Date }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { data: doctors } = useDoctors();
  const createAppointment = useCreateAppointment();
  const { register, handleSubmit, control, reset, formState } = useForm<FormValues>({
    defaultValues: {
      type: "CONSULTATION",
      durationMinutes: "30",
      date: (defaultDate ?? new Date()).toISOString().slice(0, 10),
      time: "09:00",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const start = new Date(`${values.date}T${values.time}:00`);
      const end = new Date(start.getTime() + Number(values.durationMinutes) * 60000);
      await createAppointment.mutateAsync({
        patientId: values.patientId,
        doctorId: values.doctorId,
        type: values.type,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        reason: values.reason,
      });
      toast.success(t("dashboard.appointments.form.bookedToast"));
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("dashboard.appointments.form.bookFailedToast"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> {t("dashboard.appointments.form.trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.appointments.form.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("dashboard.appointments.form.patientLabel")}</Label>
            <Controller
              control={control}
              name="patientId"
              rules={{ required: true }}
              render={({ field }) => <PatientCombobox value={field.value} onChange={(id) => field.onChange(id)} />}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("dashboard.appointments.form.doctorLabel")}</Label>
            <Controller
              control={control}
              name="doctorId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard.appointments.form.selectDoctorPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        Dr. {d.user.firstName} {d.user.lastName} {d.specialization ? `· ${d.specialization}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>{t("dashboard.appointments.form.dateLabel")}</Label>
              <Input type="date" {...register("date", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dashboard.appointments.form.timeLabel")}</Label>
              <Input type="time" {...register("time", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dashboard.appointments.form.durationLabel")}</Label>
              <Input type="number" step="5" {...register("durationMinutes", { required: true })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("dashboard.appointments.form.typeLabel")}</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`appointmentType.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("dashboard.appointments.form.reasonLabel")}</Label>
            <Textarea rows={2} {...register("reason")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={formState.isSubmitting}>
              {t("dashboard.appointments.form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
