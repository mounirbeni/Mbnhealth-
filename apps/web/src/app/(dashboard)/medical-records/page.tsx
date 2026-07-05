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
import { useCreateMedicalRecord, useCreatePrescription, useFinalizeMedicalRecord, useMedicalRecords } from "@/hooks/use-medical-records";
import { ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

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
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { data: doctors } = useDoctors();
  const createRecord = useCreateMedicalRecord();
  const { register, handleSubmit, control, reset } = useForm<SoapFormValues>();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> {t("dashboard.medicalRecords.newSoapNote")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("dashboard.medicalRecords.newNoteDialogTitle")}</DialogTitle>
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
              toast.success(t("dashboard.medicalRecords.noteSavedToast"));
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.medicalRecords.noteSaveFailedToast"));
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>{t("dashboard.medicalRecords.doctorLabel")}</Label>
            <Controller
              control={control}
              name="doctorId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard.medicalRecords.selectDoctorPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {t("patientPortal.clinicProfile.doctorTitle", { name: `${d.user.firstName} ${d.user.lastName}` })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.medicalRecords.subjectiveLabel")}</Label>
            <Textarea rows={2} {...register("subjective")} placeholder={t("dashboard.medicalRecords.subjectivePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.medicalRecords.objectiveLabel")}</Label>
            <Textarea rows={2} {...register("objective")} placeholder={t("dashboard.medicalRecords.objectivePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.medicalRecords.assessmentLabel")}</Label>
            <Textarea rows={2} {...register("assessment")} placeholder={t("dashboard.medicalRecords.assessmentPlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.medicalRecords.planLabel")}</Label>
            <Textarea rows={2} {...register("plan")} placeholder={t("dashboard.medicalRecords.planPlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.medicalRecords.primaryDiagnosisLabel")}</Label>
            <Input {...register("diagnosisDescription")} placeholder={t("dashboard.medicalRecords.primaryDiagnosisPlaceholder")} />
          </div>
          <DialogFooter>
            <Button type="submit">{t("dashboard.medicalRecords.saveNote")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewPrescriptionDialog({ patientId }: { patientId: string }) {
  const { t } = useLocale();
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
          <Plus /> {t("dashboard.medicalRecords.newPrescription")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("dashboard.medicalRecords.quickPrescriptionTitle")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createPrescription.mutateAsync({ patientId, doctorId: v.doctorId, items: v.items });
              toast.success(t("dashboard.medicalRecords.prescriptionIssuedToast"));
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.medicalRecords.prescriptionFailedToast"));
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>{t("dashboard.medicalRecords.doctorLabel")}</Label>
            <Controller
              control={control}
              name="doctorId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard.medicalRecords.selectDoctorPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {t("patientPortal.clinicProfile.doctorTitle", { name: `${d.user.firstName} ${d.user.lastName}` })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-5 items-center gap-2">
              <Input
                className="col-span-2"
                placeholder={t("dashboard.medicalRecords.drugNamePlaceholder")}
                {...register(`items.${index}.drugName`, { required: true })}
              />
              <Input placeholder={t("dashboard.medicalRecords.dosagePlaceholder")} {...register(`items.${index}.dosage`)} />
              <Input placeholder={t("dashboard.medicalRecords.frequencyPlaceholder")} {...register(`items.${index}.frequency`)} />
              <div className="flex gap-1">
                <Input placeholder={t("dashboard.medicalRecords.durationPlaceholder")} {...register(`items.${index}.duration`)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                  ×
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ drugName: "", dosage: "", frequency: "", duration: "" })}>
            <Plus className="h-3 w-3" /> {t("dashboard.medicalRecords.addDrug")}
          </Button>
          <DialogFooter>
            <Button type="submit">{t("dashboard.medicalRecords.issuePrescription")}</Button>
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
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t("dashboard.medicalRecords.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.medicalRecords.subtitle")}</p>
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
        <p className="text-sm text-muted-foreground">{t("dashboard.medicalRecords.selectPatientPrompt")}</p>
      ) : records && records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">
                    {t("patientPortal.clinicProfile.doctorTitle", {
                      name: `${record.doctor.user.firstName} ${record.doctor.user.lastName}`,
                    })}{" "}
                    · {formatDateTime(record.visitDate)}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={record.status === "FINALIZED" ? "success" : "secondary"}>
                    {t(`workflowStatus.${record.status}`)}
                  </Badge>
                  {record.status === "DRAFT" && (
                    <Button size="sm" variant="outline" onClick={() => finalizeRecord.mutate(record.id)}>
                      {t("dashboard.medicalRecords.finalize")}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">{t("dashboard.medicalRecords.subjective")}</p>
                  <p>{record.subjective || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">{t("dashboard.medicalRecords.objective")}</p>
                  <p>{record.objective || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">{t("dashboard.medicalRecords.assessment")}</p>
                  <p>{record.assessment || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">{t("dashboard.medicalRecords.plan")}</p>
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
        <p className="text-sm text-muted-foreground">{t("dashboard.medicalRecords.noRecords")}</p>
      )}
    </div>
  );
}
