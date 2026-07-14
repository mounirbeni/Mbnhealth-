"use client";

import { useFieldArray, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDoctors } from "@/hooks/use-doctors";
import { useCreatePrescription } from "@/hooks/use-medical-records";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

interface PrescriptionFormValues {
  doctorId: string;
  items: { drugName: string; dosage: string; frequency: string; duration: string }[];
}

export function QuickPrescriptionForm({
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
  const createPrescription = useCreatePrescription();
  const { register, handleSubmit, control, reset } = useForm<PrescriptionFormValues>({
    defaultValues: { doctorId: defaultDoctorId, items: [{ drugName: "", dosage: "", frequency: "", duration: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        try {
          await createPrescription.mutateAsync({ patientId, doctorId: v.doctorId, items: v.items });
          toast.success(t("dashboard.medicalRecords.prescriptionIssuedToast"));
          reset({ doctorId: v.doctorId, items: [{ drugName: "", dosage: "", frequency: "", duration: "" }] });
          onSaved?.();
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
      <Button type="submit" disabled={createPrescription.isPending}>
        {t("dashboard.medicalRecords.issuePrescription")}
      </Button>
    </form>
  );
}
