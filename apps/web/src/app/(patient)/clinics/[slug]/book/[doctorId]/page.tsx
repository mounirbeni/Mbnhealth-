"use client";

import { Suspense, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patientApi, ApiError } from "@/lib/patient-api-client";
import { usePatientAuth } from "@/lib/patient-auth-context";

interface Slot {
  start: string;
  end: string;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
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
        <h1 className="text-2xl font-bold tracking-tight">Book an appointment</h1>
        <Link href={`/clinics/${params.slug}`} className="text-sm text-primary hover:underline">
          &larr; Back to clinic
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pick a date</CardTitle>
          <CardDescription>Available 30-minute slots for this doctor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="date" min={todayIso()} value={date} onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); }} />

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading availability...</p>
          ) : !data || data.slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No availability on this date — try another day.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {data.slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start;
                const label = new Date(slot.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
                return (
                  <Button
                    key={slot.start}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Confirm your appointment</CardTitle>
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
              <p className="text-xs text-muted-foreground">
                Only needed the first time you book with this clinic.
              </p>
            </div>
            <Button className="w-full" disabled={!patient || submitting} onClick={confirmBooking}>
              {submitting ? "Booking..." : "Confirm appointment"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
