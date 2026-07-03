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
  const [open, setOpen] = useState(false);
  const { data: doctors } = useDoctors();
  const createAppointment = useCreateAppointment();
  const { register, handleSubmit, control, reset } = useForm<FormValues>({
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
      toast.success("Appointment booked");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to book appointment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Patient</Label>
            <Controller
              control={control}
              name="patientId"
              rules={{ required: true }}
              render={({ field }) => <PatientCombobox value={field.value} onChange={(id) => field.onChange(id)} />}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Doctor</Label>
            <Controller
              control={control}
              name="doctorId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
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
              <Label>Date</Label>
              <Input type="date" {...register("date", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" {...register("time", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" step="5" {...register("durationMinutes", { required: true })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Reason for visit</Label>
            <Textarea rows={2} {...register("reason")} />
          </div>

          <DialogFooter>
            <Button type="submit">Book appointment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
