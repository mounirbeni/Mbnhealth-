"use client";

import { Suspense, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, CalendarX2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { patientApi, ApiError } from "@/lib/patient-api-client";
import { usePatientAuth } from "@/lib/patient-auth-context";

interface Slot {
  start: string;
  end: string;
}

interface ClinicProfile {
  name: string;
  primaryColor: string | null;
  doctors: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    specialization: string;
    consultationFee: string | null;
  }[];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatSlotTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

export default function BookAppointmentPage({ params }: { params: { slug: string; doctorId: string } }) {
  return (
    <Suspense fallback={null}>
      <BookAppointmentForm params={params} />
    </Suspense>
  );
}

function BookAppointmentForm({ params }: { params: { slug: string; doctorId: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { patient, isLoading: authLoading } = usePatientAuth();
  // A sign-in/register detour navigates away and back to this page, which
  // remounts it and would otherwise drop the slot the patient already
  // picked — restore it from the URL instead of making them reselect.
  const restoredStart = searchParams.get("start");
  const restoredEnd = searchParams.get("end");
  const [date, setDate] = useState(searchParams.get("date") ?? todayIso());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(
    restoredStart && restoredEnd ? { start: restoredStart, end: restoredEnd } : null,
  );
  const [reason, setReason] = useState("");
  const [dob, setDob] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["availability", params.slug, params.doctorId, date],
    queryFn: () =>
      patientApi.get<{ date: string; slots: Slot[] }>(
        `/public/clinics/${params.slug}/doctors/${params.doctorId}/availability?date=${date}`,
        { skipAuth: true },
      ),
  });

  // Reuses the same query key as the clinic profile page, so no extra
  // request is made when arriving here via "Book" from that page.
  const { data: clinic } = useQuery({
    queryKey: ["clinic-profile", params.slug],
    queryFn: () => patientApi.get<ClinicProfile>(`/public/clinics/${params.slug}`, { skipAuth: true }),
  });
  const doctor = clinic?.doctors.find((d) => d.id === params.doctorId);

  const returnUrl = selectedSlot
    ? `${pathname}?${new URLSearchParams({ date, start: selectedSlot.start, end: selectedSlot.end })}`
    : pathname;

  const confirmBooking = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      await patientApi.post("/public/bookings", {
        tenantSlug: params.slug,
        doctorId: params.doctorId,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        reason: reason || undefined,
        dob: dob || undefined,
      });
      toast.success("Appointment booked!");
      router.push("/patient/appointments");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not book this appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href={`/clinics/${params.slug}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to clinic
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Book an appointment</h1>
      </div>

      {doctor && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Avatar className="h-11 w-11">
            {doctor.avatarUrl && <AvatarImage src={doctor.avatarUrl} alt="" />}
            <AvatarFallback
              className="text-sm font-semibold"
              style={{ backgroundColor: `${clinic?.primaryColor ?? "#0EA5E9"}26`, color: clinic?.primaryColor ?? "#0EA5E9" }}
            >
              {doctor.firstName[0]}
              {doctor.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              Dr. {doctor.firstName} {doctor.lastName}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {doctor.specialization} · {clinic!.name}
            </p>
          </div>
          {doctor.consultationFee && (
            <span className="shrink-0 text-sm font-medium text-muted-foreground">{doctor.consultationFee} MAD</span>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              1
            </span>
            Choose a date & time
          </CardTitle>
          <CardDescription>Available 30-minute slots for this doctor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="date"
            min={todayIso()}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedSlot(null);
            }}
          />

          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : !data || data.slots.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
              <CalendarX2 className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No availability on this date — try another day.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {data.slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <Button
                    key={slot.start}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {formatSlotTime(slot.start)}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSlot && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                2
              </span>
              Confirm your appointment
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              {new Date(selectedSlot.start).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })}
              {" · "}
              {formatSlotTime(selectedSlot.start)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!authLoading && !patient && (
              <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
                Sign in or create a free account to confirm this booking.
                <div className="mt-2 flex gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/patient/login?next=${encodeURIComponent(returnUrl)}`}>Sign in</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/patient/register?next=${encodeURIComponent(returnUrl)}`}>
                      Create account
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for visit (optional)</Label>
              <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Routine checkup" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of birth</Label>
              <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              <p className="text-xs text-muted-foreground">Only needed the first time you book with this clinic.</p>
            </div>
            <Button className="w-full" disabled={!patient || submitting} onClick={confirmBooking}>
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? "Booking..." : "Confirm appointment"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
