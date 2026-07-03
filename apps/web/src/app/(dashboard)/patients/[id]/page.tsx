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

function AddAllergyDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ substance: string; reaction?: string }>();
  const addAllergy = useAddAllergy(patientId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add allergy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add allergy</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await addAllergy.mutateAsync(v);
              toast.success("Allergy added");
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed");
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Substance</Label>
            <Input {...register("substance", { required: true })} placeholder="Penicillin" />
          </div>
          <div className="space-y-1.5">
            <Label>Reaction</Label>
            <Input {...register("reaction")} placeholder="Rash, hives..." />
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddMedicationDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ name: string; dosage?: string; frequency?: string }>();
  const addMedication = useAddMedication(patientId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add medication
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add medication</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await addMedication.mutateAsync(v);
              toast.success("Medication added");
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed");
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input {...register("name", { required: true })} placeholder="Metformin" />
          </div>
          <div className="space-y-1.5">
            <Label>Dosage</Label>
            <Input {...register("dosage")} placeholder="500mg" />
          </div>
          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <Input {...register("frequency")} placeholder="2x daily" />
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddVitalDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<Record<string, string>>();
  const addVital = useAddVital(patientId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Record vitals
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record vitals</DialogTitle>
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
              toast.success("Vitals recorded");
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed");
            }
          })}
          className="grid grid-cols-2 gap-3"
        >
          <div className="space-y-1.5">
            <Label>Temperature (°C)</Label>
            <Input type="number" step="0.1" {...register("temperatureC")} />
          </div>
          <div className="space-y-1.5">
            <Label>Heart rate (bpm)</Label>
            <Input type="number" {...register("heartRate")} />
          </div>
          <div className="space-y-1.5">
            <Label>BP Systolic</Label>
            <Input type="number" {...register("bloodPressureSystolic")} />
          </div>
          <div className="space-y-1.5">
            <Label>BP Diastolic</Label>
            <Input type="number" {...register("bloodPressureDiastolic")} />
          </div>
          <div className="space-y-1.5">
            <Label>Weight (kg)</Label>
            <Input type="number" step="0.1" {...register("weightKg")} />
          </div>
          <div className="space-y-1.5">
            <Label>Height (cm)</Label>
            <Input type="number" step="0.1" {...register("heightCm")} />
          </div>
          <DialogFooter className="col-span-2">
            <Button type="submit">Save</Button>
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

  if (isLoading || !patient) {
    return <div className="text-sm text-muted-foreground">Loading patient record...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">{initials(patient.firstName, patient.lastName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {patient.mrn} · {formatDate(patient.dob)} · {patient.gender}
          </p>
        </div>
        <Badge variant={patient.status === "ACTIVE" ? "success" : "secondary"}>{patient.status}</Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Phone:</span> {patient.phone ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span> {patient.email ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Address:</span> {patient.address ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Emergency contact:</span>{" "}
                  {patient.emergencyContactName ? `${patient.emergencyContactName} (${patient.emergencyContactPhone})` : "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Insurance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Provider:</span> {patient.insuranceProvider ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Policy number:</span> {patient.insurancePolicyNumber ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Blood type:</span> {patient.bloodType ?? "—"}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allergies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Allergies</CardTitle>
              <AddAllergyDialog patientId={patient.id} />
            </CardHeader>
            <CardContent className="space-y-2">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-sm font-medium">{a.substance}</p>
                      <p className="text-xs text-muted-foreground">{a.reaction ?? "No reaction noted"}</p>
                    </div>
                    <Badge className="ml-auto" variant={a.severity === "SEVERE" ? "destructive" : "warning"}>
                      {a.severity}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No known allergies.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medications</CardTitle>
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
                      {m.isActive ? "Active" : "Stopped"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No medications on record.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vital signs</CardTitle>
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
                <p className="text-sm text-muted-foreground">No vitals recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Patient timeline</CardTitle>
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
                        <Badge variant="outline" className="ml-1 capitalize">
                          {event.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm">{describeTimelineEvent(event)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No history yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function describeTimelineEvent(event: { type: string; data: any }): string {
  switch (event.type) {
    case "appointment":
      return `Appointment (${event.data.status}) with Dr. ${event.data.doctor?.user?.firstName ?? ""} ${event.data.doctor?.user?.lastName ?? ""}`;
    case "medical_record":
      return event.data.assessment || "Consultation note";
    case "prescription":
      return `Prescription issued (${event.data.items?.length ?? 0} item(s))`;
    case "lab_order":
      return `Lab order: ${event.data.testName} (${event.data.status})`;
    case "radiology_order":
      return `Radiology: ${event.data.examType} (${event.data.status})`;
    case "invoice":
      return `Invoice ${event.data.invoiceNumber} (${event.data.status})`;
    default:
      return "Event";
  }
}
