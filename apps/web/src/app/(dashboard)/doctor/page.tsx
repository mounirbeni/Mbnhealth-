"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Stethoscope } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PatientCombobox } from "@/components/patients/patient-combobox";
import { RecordCard } from "@/components/medical-records/record-card";
import { SoapNoteForm } from "@/components/medical-records/soap-note-form";
import { QuickPrescriptionForm } from "@/components/medical-records/quick-prescription-form";
import { useAppointments } from "@/hooks/use-appointments";
import { useDoctors } from "@/hooks/use-doctors";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { useAuth } from "@/lib/auth-context";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { cn, formatDateTime, initials } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Appointment } from "@/types";

function useBelowBreakpoint(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function PatientDetailPanel({
  patientId,
  patientLabel,
  defaultDoctorId,
}: {
  patientId: string;
  patientLabel: string;
  defaultDoctorId?: string;
}) {
  const { t } = useLocale();
  const { data: records, isLoading } = useMedicalRecords(patientId);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{t("dashboard.medicalRecords.title")}</p>
        <h2 className="text-section-title">{patientLabel}</h2>
      </div>
      <Tabs defaultValue="note">
        <TabsList>
          <TabsTrigger value="note">{t("dashboard.doctorWorkspace.noteTab")}</TabsTrigger>
          <TabsTrigger value="prescription">{t("dashboard.doctorWorkspace.prescriptionTab")}</TabsTrigger>
          <TabsTrigger value="history">{t("dashboard.doctorWorkspace.historyTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="note">
          <SoapNoteForm patientId={patientId} defaultDoctorId={defaultDoctorId} />
        </TabsContent>
        <TabsContent value="prescription">
          <QuickPrescriptionForm patientId={patientId} defaultDoctorId={defaultDoctorId} />
        </TabsContent>
        <TabsContent value="history" className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : records && records.length > 0 ? (
            records.map((record: any) => <RecordCard key={record.id} record={record} />)
          ) : (
            <p className="text-sm text-muted-foreground">{t("dashboard.doctorWorkspace.historyEmpty")}</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DoctorWorkspacePage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { data: doctors } = useDoctors();
  const [selected, setSelected] = useState<{ patientId: string; label: string } | null>(null);
  const [lookupPatientId, setLookupPatientId] = useState<string | undefined>();
  const isBelowLg = useBelowBreakpoint("(max-width: 1023px)");

  const myDoctor = useMemo(() => doctors?.find((d) => d.user.id === user?.userId), [doctors, user?.userId]);

  const { from, to } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }, []);

  const { data: appointments, isLoading: isLoadingQueue } = useAppointments({ from, to });

  const queue = (appointments ?? [])
    .filter((a: Appointment) => !myDoctor || a.doctorId === myDoctor.id)
    .sort((a: Appointment, b: Appointment) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const selectPatient = (appointment: Appointment) => {
    setSelected({ patientId: appointment.patientId, label: `${appointment.patient.firstName} ${appointment.patient.lastName}` });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-page-title">{t("dashboard.doctorWorkspace.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.doctorWorkspace.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full space-y-2 lg:max-w-sm">
          {isLoadingQueue ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : queue.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              {t("dashboard.doctorWorkspace.queueEmpty")}
            </p>
          ) : (
            <ul className="space-y-2">
              {queue.map((appointment: Appointment) => {
                const active = selected?.patientId === appointment.patientId;
                return (
                  <li key={appointment.id}>
                    <button
                      onClick={() => selectPatient(appointment)}
                      className={cn(
                        "surface-card-hover flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-colors",
                        active ? "border-primary bg-primary/5" : "border-border bg-card",
                      )}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback>{initials(appointment.patient.firstName, appointment.patient.lastName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{formatDateTime(appointment.startTime)}</p>
                      </div>
                      <Badge variant={STATUS_BADGE_VARIANT[appointment.status] ?? "secondary"}>
                        {t(`appointmentStatus.${appointment.status}`)}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center gap-2 border-t border-border pt-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <PatientCombobox
                value={lookupPatientId}
                onChange={(id, label) => {
                  setLookupPatientId(id);
                  setSelected({ patientId: id, label });
                }}
              />
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:flex-1">
          {selected ? (
            <Card className="surface-card p-5">
              <PatientDetailPanel patientId={selected.patientId} patientLabel={selected.label} defaultDoctorId={myDoctor?.id} />
            </Card>
          ) : (
            <EmptyState icon={Stethoscope} title={t("dashboard.doctorWorkspace.selectPatientHint")} className="h-full min-h-[240px]" />
          )}
        </div>
      </div>

      <Sheet open={isBelowLg && !!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="end" className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <SheetHeader className="sr-only">
              <SheetTitle>{selected.label}</SheetTitle>
            </SheetHeader>
          )}
          {selected && (
            <PatientDetailPanel patientId={selected.patientId} patientLabel={selected.label} defaultDoctorId={myDoctor?.id} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
