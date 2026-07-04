"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Search,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { patientApi } from "@/lib/patient-api-client";
import { usePatientAuth } from "@/lib/patient-auth-context";

interface Filters {
  cities: string[];
  specialties: string[];
}

const VALUE_PROPS = [
  {
    icon: CalendarCheck,
    title: "Real-time availability",
    desc: "See a doctor's actual open slots — no phone calls, no waiting for a callback.",
  },
  {
    icon: Users,
    title: "One account, every clinic",
    desc: "Sign up once and book with any clinic on MBN Health — no new form each time.",
  },
  {
    icon: ShieldCheck,
    title: "Your data stays private",
    desc: "Each clinic only ever sees your own record. Nothing is shared between clinics.",
  },
  {
    icon: Smartphone,
    title: "Nothing to install",
    desc: "Search, book and manage appointments from any browser — no app required.",
  },
];

const STEPS = [
  { icon: Search, title: "Search", desc: "Find a clinic by name, city, or specialty." },
  { icon: CalendarClock, title: "Pick a time", desc: "See real open slots and choose what works for you." },
  { icon: CheckCircle2, title: "Confirm", desc: "Sign in or create a free account, and you're booked." },
];

export default function PatientLandingPage() {
  const { patient } = usePatientAuth();
  const { data: filters } = useQuery({
    queryKey: ["clinic-filters"],
    queryFn: () => patientApi.get<Filters>("/public/clinics/filters", { skipAuth: true }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center sm:p-14">
        <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Book a doctor&apos;s appointment in seconds
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Search real clinics, see real availability, and confirm your visit instantly — all in one place, for every
          clinic on MBN Health.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/find-a-clinic">Find a clinic</Link>
          </Button>
          {!patient && (
            <Button size="lg" variant="outline" asChild>
              <Link href="/patient/register">Create a free account</Link>
            </Button>
          )}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-6 text-center text-xl font-semibold">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold">
                {i + 1}. {step.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUE_PROPS.map((item) => (
            <Card key={item.title}>
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular specialties */}
      {!!filters?.specialties.length && (
        <section>
          <h2 className="mb-4 flex items-center justify-center gap-2 text-center text-xl font-semibold">
            <Stethoscope className="h-4.5 w-4.5 text-primary" /> Popular specialties
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {filters.specialties.map((s) => (
              <Link
                key={s}
                href={`/find-a-clinic?specialty=${encodeURIComponent(s)}`}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {s}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold">Ready to book your visit?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          It only takes a minute to find a clinic and confirm your appointment.
        </p>
        <Button size="lg" className="mt-5" asChild>
          <Link href="/find-a-clinic">Find a clinic</Link>
        </Button>
      </section>
    </div>
  );
}
