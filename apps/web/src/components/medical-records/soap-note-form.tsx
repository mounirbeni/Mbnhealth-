"use client";

import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDoctors } from "@/hooks/use-doctors";
import { useCreateMedicalRecord } from "@/hooks/use-medical-records";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

interface SoapFormValues {
  doctorId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosisDescription: string;
}

export function SoapNoteForm({
  patientId,
  defaultDoctorId,
  onSaved,
}: {
  patientId: string;
  defaultDoctorId?: string;
  onSaved?: () => void;
}) {
  const { t } = useLocale();
  const { data: doctors } = useDoctors();
  const createRecord = useCreateMedicalRecord();
  const { register, handleSubmit, control, reset } = useForm<SoapFormValues>({
    defaultValues: { doctorId: defaultDoctorId },
  });

  return (
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
          reset({ doctorId: v.doctorId });
          onSaved?.();
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
      <Button type="submit" disabled={createRecord.isPending}>
        {t("dashboard.medicalRecords.saveNote")}
      </Button>
    </form>
  );
}
