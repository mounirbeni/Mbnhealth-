"use client";

import { useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Pill, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientCombobox } from "@/components/patients/patient-combobox";
import { useDoctors } from "@/hooks/use-doctors";
import { useCreatePrescription, usePrescriptions, useUpdatePrescription } from "@/hooks/use-prescriptions";
import { useAuth } from "@/lib/auth-context";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface PrescriptionFormValues {
  patientId: string;
  doctorId: string;
  notes: string;
  items: { drugName: string; dosage: string; frequency: string; duration: string }[];
}

function NewPrescriptionDialog() {
  const [open, setOpen] = useState(false);
  const { data: doctors } = useDoctors();
  const createPrescription = useCreatePrescription();
  const { register, handleSubmit, control, reset } = useForm<PrescriptionFormValues>({
    defaultValues: { items: [{ drugName: "", dosage: "", frequency: "", duration: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit = async (values: PrescriptionFormValues) => {
    try {
      await createPrescription.mutateAsync({
        patientId: values.patientId,
        doctorId: values.doctorId,
        notes: values.notes || undefined,
        items: values.items,
      });
      toast.success("Prescription issued");
      reset();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to issue prescription");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New prescription</DialogTitle>
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
            <Label>Prescribing doctor</Label>
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
                        Dr. {d.user.firstName} {d.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Medications</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input placeholder="Drug name" className="flex-1" {...register(`items.${index}.drugName`, { required: true })} />
                <Input placeholder="Dosage" className="w-24" {...register(`items.${index}.dosage`)} />
                <Input placeholder="Frequency" className="w-28" {...register(`items.${index}.frequency`)} />
                <Input placeholder="Duration" className="w-24" {...register(`items.${index}.duration`)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ drugName: "", dosage: "", frequency: "", duration: "" })}
            >
              <Plus className="h-3.5 w-3.5" /> Add medication
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input {...register("notes")} placeholder="Take with food" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createPrescription.isPending}>
              Issue prescription
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PrescriptionsPage() {
  const { data: prescriptions, isLoading } = usePrescriptions();
  const updatePrescription = useUpdatePrescription();
  const { hasPermission } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Prescriptions</h1>
          <p className="text-sm text-muted-foreground">All medications prescribed across your clinic</p>
        </div>
        {hasPermission("PRESCRIPTIONS_WRITE") && <NewPrescriptionDialog />}
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medications</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : prescriptions && prescriptions.length > 0 ? (
              prescriptions.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 shrink-0 text-primary" />
                      <span>{p.items.map((i: any) => i.drugName).join(", ")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.patient.firstName} {p.patient.lastName}
                  </TableCell>
                  <TableCell>
                    Dr. {p.doctor.user.firstName} {p.doctor.user.lastName}
                  </TableCell>
                  <TableCell>{formatDate(p.issuedDate)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[p.status] ?? "secondary"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    {hasPermission("PRESCRIPTIONS_WRITE") && p.status === "ACTIVE" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePrescription.mutate({ id: p.id, action: "complete" })}
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePrescription.mutate({ id: p.id, action: "cancel" })}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No prescriptions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
