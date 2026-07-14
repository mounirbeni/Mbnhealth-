"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientCombobox } from "@/components/patients/patient-combobox";
import { RecordCard } from "@/components/medical-records/record-card";
import { SoapNoteForm } from "@/components/medical-records/soap-note-form";
import { QuickPrescriptionForm } from "@/components/medical-records/quick-prescription-form";
import { useFinalizeMedicalRecord, useMedicalRecords } from "@/hooks/use-medical-records";
import { useLocale } from "@/lib/i18n/locale-context";

function NewSoapNoteDialog({ patientId }: { patientId: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

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
        <SoapNoteForm patientId={patientId} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function NewPrescriptionDialog({ patientId }: { patientId: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

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
        <QuickPrescriptionForm patientId={patientId} onSaved={() => setOpen(false)} />
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
        <h1 className="text-page-title">{t("dashboard.medicalRecords.title")}</h1>
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
            <RecordCard
              key={record.id}
              record={record}
              onFinalize={(id) => finalizeRecord.mutate(id)}
              isFinalizing={finalizeRecord.isPending}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("dashboard.medicalRecords.noRecords")}</p>
      )}
    </div>
  );
}
