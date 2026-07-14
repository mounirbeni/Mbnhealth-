"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, AlertTriangle, Pill, Activity as ActivityIcon, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePatient, usePatientTimeline, useAddAllergy, useAddMedication, useAddVital } from "@/hooks/use-patients";
import { formatDate, formatDateTime, initials } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

function AddAllergyDialog({ patientId }: { patientId: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ substance: string; reaction?: string }>();
  const addAllergy = useAddAllergy(patientId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> {t("dashboard.patientDetail.addAllergy")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.patientDetail.addAllergyTitle")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await addAllergy.mutateAsync(v);
              toast.success(t("dashboard.patientDetail.allergyAddedToast"));
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.patientDetail.addFailedToast"));
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.substanceLabel")}</Label>
            <Input {...register("substance", { required: true })} placeholder={t("dashboard.patientDetail.substancePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.reactionLabel")}</Label>
            <Input {...register("reaction")} placeholder={t("dashboard.patientDetail.reactionPlaceholder")} />
          </div>
          <DialogFooter>
            <Button type="submit">{t("dashboard.patientDetail.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddMedicationDialog({ patientId }: { patientId: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ name: string; dosage?: string; frequency?: string }>();
  const addMedication = useAddMedication(patientId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> {t("dashboard.patientDetail.addMedication")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.patientDetail.addMedicationTitle")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await addMedication.mutateAsync(v);
              toast.success(t("dashboard.patientDetail.medicationAddedToast"));
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.patientDetail.addFailedToast"));
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.nameLabel")}</Label>
            <Input {...register("name", { required: true })} placeholder={t("dashboard.patientDetail.namePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.dosageLabel")}</Label>
            <Input {...register("dosage")} placeholder={t("dashboard.patientDetail.dosagePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.frequencyLabel")}</Label>
            <Input {...register("frequency")} placeholder={t("dashboard.patientDetail.frequencyPlaceholder")} />
          </div>
          <DialogFooter>
            <Button type="submit">{t("dashboard.patientDetail.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddVitalDialog({ patientId }: { patientId: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<Record<string, string>>();
  const addVital = useAddVital(patientId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> {t("dashboard.patientDetail.recordVitals")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.patientDetail.recordVitalsTitle")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              const payload = Object.fromEntries(
                Object.entries(v)
                  .filter(([, val]) => val !== "" && val !== undefined)
                  .map(([k, val]) => [k, Number(val)]),
              );
              await addVital.mutateAsync(payload);
              toast.success(t("dashboard.patientDetail.vitalsRecordedToast"));
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.patientDetail.addFailedToast"));
            }
          })}
          className="grid grid-cols-2 gap-3"
        >
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.temperatureLabel")}</Label>
            <Input type="number" step="0.1" {...register("temperatureC")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.heartRateLabel")}</Label>
            <Input type="number" {...register("heartRate")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.bpSystolicLabel")}</Label>
            <Input type="number" {...register("bloodPressureSystolic")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.bpDiastolicLabel")}</Label>
            <Input type="number" {...register("bloodPressureDiastolic")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.weightLabel")}</Label>
            <Input type="number" step="0.1" {...register("weightKg")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.patientDetail.heightLabel")}</Label>
            <Input type="number" step="0.1" {...register("heightCm")} />
          </div>
          <DialogFooter className="col-span-2">
            <Button type="submit">{t("dashboard.patientDetail.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: patient, isLoading } = usePatient(params.id);
  const { data: timeline } = usePatientTimeline(params.id);
  const { t } = useLocale();

  if (isLoading || !patient) {
    return <div className="text-sm text-muted-foreground">{t("dashboard.patientDetail.loadingRecord")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">{initials(patient.firstName, patient.lastName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-page-title">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {patient.mrn} · {formatDate(patient.dob)} · {patient.gender}
          </p>
        </div>
        <Badge variant={patient.status === "ACTIVE" ? "success" : "secondary"}>
          {t(`patientStatus.${patient.status}`)}
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("dashboard.patientDetail.overviewTab")}</TabsTrigger>
          <TabsTrigger value="allergies">{t("dashboard.patientDetail.allergiesTab")}</TabsTrigger>
          <TabsTrigger value="medications">{t("dashboard.patientDetail.medicationsTab")}</TabsTrigger>
          <TabsTrigger value="vitals">{t("dashboard.patientDetail.vitalsTab")}</TabsTrigger>
          <TabsTrigger value="timeline">{t("dashboard.patientDetail.timelineTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.patientDetail.contactInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("dashboard.patientDetail.phoneLabel")}</span> {patient.phone ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("dashboard.patientDetail.emailLabel")}</span> {patient.email ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("dashboard.patientDetail.addressLabel")}</span> {patient.address ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("dashboard.patientDetail.emergencyContactLabel")}</span>{" "}
                  {patient.emergencyContactName ? `${patient.emergencyContactName} (${patient.emergencyContactPhone})` : "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.patientDetail.insurance")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("dashboard.patientDetail.providerLabel")}</span> {patient.insuranceProvider ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("dashboard.patientDetail.policyNumberLabel")}</span>{" "}
                  {patient.insurancePolicyNumber ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("dashboard.patientDetail.bloodTypeLabel")}</span> {patient.bloodType ?? "—"}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allergies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("dashboard.patientDetail.allergies")}</CardTitle>
              <AddAllergyDialog patientId={patient.id} />
            </CardHeader>
            <CardContent className="space-y-2">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-sm font-medium">{a.substance}</p>
                      <p className="text-xs text-muted-foreground">{a.reaction ?? t("dashboard.patientDetail.noReactionNoted")}</p>
                    </div>
                    <Badge className="ml-auto" variant={a.severity === "SEVERE" ? "destructive" : "warning"}>
                      {a.severity}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t("dashboard.patientDetail.noKnownAllergies")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("dashboard.patientDetail.medications")}</CardTitle>
              <AddMedicationDialog patientId={patient.id} />
            </CardHeader>
            <CardContent className="space-y-2">
              {patient.medications && patient.medications.length > 0 ? (
                patient.medications.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Pill className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.dosage} · {m.frequency}
                      </p>
                    </div>
                    <Badge className="ml-auto" variant={m.isActive ? "success" : "secondary"}>
                      {m.isActive ? t("common.active") : t("dashboard.patientDetail.stopped")}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t("dashboard.patientDetail.noMedications")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("dashboard.patientDetail.vitalSigns")}</CardTitle>
              <AddVitalDialog patientId={patient.id} />
            </CardHeader>
            <CardContent className="space-y-2">
              {patient.vitals && patient.vitals.length > 0 ? (
                patient.vitals.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 rounded-lg border border-border p-3 text-sm">
                    <ActivityIcon className="h-4 w-4 text-primary" />
                    <span>{formatDateTime(v.recordedAt)}</span>
                    <span className="text-muted-foreground">·</span>
                    <span>{v.temperatureC ? `${v.temperatureC}°C` : "—"}</span>
                    <span>{v.heartRate ? `${v.heartRate} bpm` : "—"}</span>
                    <span>
                      {v.bloodPressureSystolic && v.bloodPressureDiastolic
                        ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg`
                        : "—"}
                    </span>
                    <span>{v.bmi ? `BMI ${v.bmi}` : ""}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t("dashboard.patientDetail.noVitals")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.patientDetail.patientTimeline")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 border-l border-border pl-4">
                {timeline && timeline.length > 0 ? (
                  timeline.map((event, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(event.date)}
                        <Badge variant="outline" className="ml-1">
                          {t(`dashboard.patientDetail.eventType.${event.type}`)}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm">{describeTimelineEvent(event, t)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("dashboard.patientDetail.noHistory")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function describeTimelineEvent(event: { type: string; data: any }, t: ReturnType<typeof useLocale>["t"]): string {
  switch (event.type) {
    case "appointment":
      return t("dashboard.patientDetail.eventAppointment", {
        status: t(`appointmentStatus.${event.data.status}`),
        doctor: t("patientPortal.clinicProfile.doctorTitle", {
          name: `${event.data.doctor?.user?.firstName ?? ""} ${event.data.doctor?.user?.lastName ?? ""}`,
        }),
      });
    case "medical_record":
      return event.data.assessment || t("dashboard.patientDetail.eventConsultationNote");
    case "prescription":
      return t("dashboard.patientDetail.eventPrescription", { count: event.data.items?.length ?? 0 });
    case "lab_order":
      return t("dashboard.patientDetail.eventLabOrder", {
        test: event.data.testName,
        status: t(`workflowStatus.${event.data.status}`),
      });
    case "radiology_order":
      return t("dashboard.patientDetail.eventRadiologyOrder", {
        exam: event.data.examType,
        status: t(`workflowStatus.${event.data.status}`),
      });
    case "invoice":
      return t("dashboard.patientDetail.eventInvoice", {
        number: event.data.invoiceNumber,
        status: t(`workflowStatus.${event.data.status}`),
      });
    default:
      return t("dashboard.patientDetail.eventGeneric");
  }
}
