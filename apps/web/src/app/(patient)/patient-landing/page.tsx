"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { patientApi } from "@/lib/patient-api-client";
import { usePatientAuth } from "@/lib/patient-auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { fadeInUp, staggerChildren } from "@/lib/motion";

interface Filters {
  cities: string[];
  specialties: string[];
}

const VALUE_PROPS = [
  { icon: CalendarCheck, key: "availability" },
  { icon: Users, key: "oneAccount" },
  { icon: ShieldCheck, key: "private" },
  { icon: Smartphone, key: "noInstall" },
] as const;

const STEPS = [
  { icon: Search, key: "step1" },
  { icon: CalendarClock, key: "step2" },
  { icon: CheckCircle2, key: "step3" },
] as const;

export default function PatientLandingPage() {
  const { patient } = usePatientAuth();
  const { t } = useLocale();
  const { data: filters } = useQuery({
    queryKey: ["clinic-filters"],
    queryFn: () => patientApi.get<Filters>("/public/clinics/filters", { skipAuth: true }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center sm:p-14">
        <div className="bg-grid-fade pointer-events-none absolute inset-0" />
        <div className="relative">
          <h1 className="mx-auto max-w-2xl text-display-sm sm:text-display">
            {t("patientPortal.landing.heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("patientPortal.landing.heroSubtitle")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/find-a-clinic">{t("patientPortal.landing.findClinicCta")}</Link>
            </Button>
            {!patient && (
              <Button size="lg" variant="outline" asChild>
                <Link href="/patient/register">{t("patientPortal.landing.createAccountCta")}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-6 text-center text-section-title">{t("patientPortal.landing.howItWorks")}</h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerChildren}
          className="grid gap-6 grid-cols-1 sm:grid-cols-3"
        >
          {STEPS.map((step, i) => (
            <motion.div key={step.key} variants={fadeInUp} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold">
                {i + 1}. {t(`patientPortal.landing.${step.key}Title`)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t(`patientPortal.landing.${step.key}Desc`)}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Value props */}
      <section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerChildren}
          className="grid gap-4 grid-cols-1 sm:grid-cols-2"
        >
          {VALUE_PROPS.map((item) => (
            <motion.div key={item.key} variants={fadeInUp}>
              <Card className="surface-card-hover">
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t(`patientPortal.landing.${item.key}Title`)}</CardTitle>
                    <CardDescription>{t(`patientPortal.landing.${item.key}Desc`)}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Popular specialties */}
      {!!filters?.specialties.length && (
        <section>
          <h2 className="mb-4 flex items-center justify-center gap-2 text-center text-section-title">
            <Stethoscope className="h-4.5 w-4.5 text-primary" /> {t("patientPortal.landing.popularSpecialties")}
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
        <h2 className="text-section-title">{t("patientPortal.landing.finalCtaTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("patientPortal.landing.finalCtaDesc")}</p>
        <Button size="lg" className="mt-5" asChild>
          <Link href="/find-a-clinic">{t("patientPortal.landing.findClinicCta")}</Link>
        </Button>
      </section>
    </div>
  );
}
