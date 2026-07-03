"use client";

import { useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { FileText, Plus, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientCombobox } from "@/components/patients/patient-combobox";
import { useDoctors } from "@/hooks/use-doctors";
import { useCreateMedicalRecord, useFinalizeMedicalRecord, useMedicalRecords } from "@/hooks/use-medical-records";
import { useCreatePrescription } from "@/hooks/use-prescriptions";
import { ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";

interface SoapFormValues {
  doctorId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosisDescription: string;
}

interface PrescriptionFormValues {
  doctorId: string;
  items: { drugName: string; dosage: string; frequency: string; duration: string }[];
}

function NewSoapNoteDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const { data: doctors } = useDoctors();
  const createRecord = useCreateMedicalRecord();
  const { register, handleSubmit, control, reset } = useForm<SoapFormValues>();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New SOAP note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New consultation note</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createRecord.mutateAsync({
                patientId,
                doctorId: v.doctorId,
                subjective: v.subjective,
                objective: v.objective,
                assessment: v.assessment,
                plan: v.plan,
                diagnoses: v.diagnosisDescription ? [{ description: v.diagnosisDescription, isPrimary: true }] : undefined,
              });
              toast.success("Consultation note saved as draft");
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed to save note");
            }
          })}
          className="space-y-4"
        >
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
                        Dr. {d.user.firstName} {d.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Subjective</Label>
            <Textarea rows={2} {...register("subjective")} placeholder="Patient-reported symptoms..." />
          </div>
          <div className="space-y-1.5">
            <Label>Objective</Label>
            <Textarea rows={2} {...register("objective")} placeholder="Exam findings, vitals..." />
          </div>
          <div className="space-y-1.5">
            <Label>Assessment</Label>
            <Textarea rows={2} {...register("assessment")} placeholder="Clinical assessment..." />
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Textarea rows={2} {...register("plan")} placeholder="Treatment plan, follow-up..." />
          </div>
          <div className="space-y-1.5">
            <Label>Primary diagnosis</Label>
            <Input {...register("diagnosisDescription")} placeholder="e.g. Tension headache" />
          </div>
          <DialogFooter>
            <Button type="submit">Save note</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewPrescriptionDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const { data: doctors } = useDoctors();
  const createPrescription = useCreatePrescription();
  const { register, handleSubmit, control, reset } = useForm<PrescriptionFormValues>({
    defaultValues: { items: [{ drugName: "", dosage: "", frequency: "", duration: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> New prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Quick prescription</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createPrescription.mutateAsync({ patientId, doctorId: v.doctorId, items: v.items });
              toast.success("Prescription issued");
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed to issue prescription");
            }
          })}
          className="space-y-4"
        >
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
                        Dr. {d.user.firstName} {d.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-5 items-center gap-2">
              <Input className="col-span-2" placeholder="Drug name" {...register(`items.${index}.drugName`, { required: true })} />
              <Input placeholder="Dosage" {...register(`items.${index}.dosage`)} />
              <Input placeholder="Frequency" {...register(`items.${index}.frequency`)} />
              <div className="flex gap-1">
                <Input placeholder="Duration" {...register(`items.${index}.duration`)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                  ×
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ drugName: "", dosage: "", frequency: "", duration: "" })}>
            <Plus className="h-3 w-3" /> Add drug
          </Button>
          <DialogFooter>
            <Button type="submit">Issue prescription</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MedicalRecordsPage() {
  const [patientId, setPatientId] = useState<string | undefined>();
  const { data: records } = useMedicalRecords(patientId);
  const finalizeRecord = useFinalizeMedicalRecord();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Medical Records</h1>
        <p className="text-sm text-muted-foreground">Select a patient to view or add SOAP notes and prescriptions.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-sm">
          <PatientCombobox value={patientId} onChange={(id) => setPatientId(id)} />
        </div>
        {patientId && (
          <div className="flex gap-2">
            <NewSoapNoteDialog patientId={patientId} />
            <NewPrescriptionDialog patientId={patientId} />
          </div>
        )}
      </div>

      {!patientId ? (
        <p className="text-sm text-muted-foreground">No patient selected.</p>
      ) : records && records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">
                    Dr. {record.doctor.user.firstName} {record.doctor.user.lastName} · {formatDateTime(record.visitDate)}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={record.status === "FINALIZED" ? "success" : "secondary"}>{record.status}</Badge>
                  {record.status === "DRAFT" && (
                    <Button size="sm" variant="outline" onClick={() => finalizeRecord.mutate(record.id)}>
                      Finalize
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Subjective</p>
                  <p>{record.subjective || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Objective</p>
                  <p>{record.objective || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Assessment</p>
                  <p>{record.assessment || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Plan</p>
                  <p>{record.plan || "—"}</p>
                </div>
                {record.diagnoses?.length > 0 && (
                  <div className="col-span-2 flex flex-wrap gap-1.5">
                    {record.diagnoses.map((d: any) => (
                      <Badge key={d.id} variant="outline">
                        <FileText className="mr-1 h-3 w-3" /> {d.description}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No medical records for this patient yet.</p>
      )}
    </div>
  );
}
