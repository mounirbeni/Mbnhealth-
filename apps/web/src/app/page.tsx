"use client";

import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  Check,
  ClipboardList,
  Mail,
  MessageCircle,
  Phone,
  Pill,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/i18n/locale-context";

// The patient portal is a deliberately separate product on its own
// subdomain (see apps/web/src/middleware.ts + README "Patient portal") —
// this is the one intentional cross-link into it from the clinic-facing
// marketing site, so it always points off-domain rather than rendering
// patient content inline here.
const PATIENT_HOST = process.env.NEXT_PUBLIC_PATIENT_HOST ?? "care.localhost:3000";
const PATIENT_PORTAL_URL = `${PATIENT_HOST.includes("localhost") ? "http" : "https"}://${PATIENT_HOST}/find-a-clinic`;
import { PRICING_PLANS } from "@/lib/pricing";

const FEATURE_ICONS = [Stethoscope, CalendarDays, MessageCircle, Bot, ClipboardList, BarChart3, Users, ShieldCheck] as const;
const FEATURE_KEYS = ["ehr", "scheduling", "whatsapp", "ai", "billing", "reports", "staff", "security"] as const;
const WHATSAPP_BULLETS = ["bullet1", "bullet2", "bullet3", "bullet4"] as const;
const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;
const TESTIMONIAL_KEYS = ["owner", "receptionist", "doctor"] as const;
const PLAN_FEATURE_KEYS: Record<string, string[]> = {
  STARTER: ["starterFeature1", "starterFeature2", "starterFeature3", "starterFeature4", "starterFeature5", "starterFeature6"],
  PROFESSIONAL: [
    "professionalFeature1",
    "professionalFeature2",
    "professionalFeature3",
    "professionalFeature4",
    "professionalFeature5",
    "professionalFeature6",
  ],
  ENTERPRISE: [
    "enterpriseFeature1",
    "enterpriseFeature2",
    "enterpriseFeature3",
    "enterpriseFeature4",
    "enterpriseFeature5",
    "enterpriseFeature6",
  ],
};
const PLAN_NAME_KEYS: Record<string, string> = { STARTER: "starterName", PROFESSIONAL: "professionalName", ENTERPRISE: "enterpriseName" };
const PLAN_TAGLINE_KEYS: Record<string, string> = {
  STARTER: "starterTagline",
  PROFESSIONAL: "professionalTagline",
  ENTERPRISE: "enterpriseTagline",
};

function MockBrowserFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="surface-elevated overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-3 truncate text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return <div className={`rounded-md bg-muted ${className ?? "h-3 w-full"}`} />;
}

export default function LandingPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">MBN Health</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">{t("marketing.nav.features")}</a>
            <a href="#whatsapp" className="hover:text-foreground">{t("marketing.nav.whatsapp")}</a>
            <a href="#pricing" className="hover:text-foreground">{t("marketing.nav.pricing")}</a>
            <a href="#faq" className="hover:text-foreground">{t("marketing.nav.faq")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">{t("marketing.nav.login")}</Link>
            </Button>
            <Button asChild>
              <a href="#contact">{t("marketing.nav.bookDemo")}</a>
            </Button>
            <LanguageSwitcher size="icon" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-grid-fade">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-gradient-to-b from-primary/12 via-primary/5 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl animate-fade-in-up text-center">
            <Badge variant="secondary" className="mb-5 border border-border/60">{t("marketing.hero.badge")}</Badge>
            <h1 className="text-display-sm text-balance sm:text-display">
              {t("marketing.hero.titleLine1")} <span className="text-primary">{t("marketing.hero.titleLine2Accent")}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">{t("marketing.hero.subtitle")}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">{t("marketing.hero.tryDemo")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">{t("marketing.hero.bookDemo")}</a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t("marketing.hero.noCard")}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("marketing.hero.patientPrompt")}{" "}
              <a href={PATIENT_PORTAL_URL} className="font-medium text-primary hover:underline">
                {t("marketing.hero.visitPortal")}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Product demo mockup */}
      <section className="mx-auto max-w-6xl animate-scale-in px-4 pb-20 sm:px-6">
        <MockBrowserFrame label={t("marketing.demoMockup.label")}>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="sm:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("marketing.demoMockup.todayAppointments")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {["09:00 — Aicha B. · Dr. Hicham", "09:30 — Youssef K. · Dr. Hicham", "10:15 — Salma T. · Dr. Nadia"].map(
                  (row) => (
                    <div key={row} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                      <span>{row}</span>
                      <Badge variant="success">{t("marketing.demoMockup.confirmed")}</Badge>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("marketing.demoMockup.thisMonth")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-semibold">312</p>
                  <p className="text-xs text-muted-foreground">{t("marketing.demoMockup.patientsSeen")}</p>
                </div>
                <SkeletonBar className="h-16 w-full" />
                <div className="flex items-center gap-1 text-xs text-success">
                  <BadgeCheck className="h-3.5 w-3.5" /> {t("marketing.demoMockup.noShowsDown")}
                </div>
              </CardContent>
            </Card>
          </div>
        </MockBrowserFrame>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t("marketing.features.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("marketing.features.subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_KEYS.map((key, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <Card key={key}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{t(`marketing.features.${key}Title`)}</CardTitle>
                  <CardDescription>{t(`marketing.features.${key}Desc`)}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Screenshots */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <MockBrowserFrame label={t("marketing.screenshots.weekViewLabel")}>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <SkeletonBar key={i} className={i % 3 === 0 ? "h-16 bg-primary/20" : "h-16"} />
              ))}
            </div>
          </MockBrowserFrame>
          <MockBrowserFrame label={t("marketing.screenshots.whatsappLabel")}>
            <div className="space-y-2.5">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
                {t("marketing.screenshots.msg1")}
              </div>
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                {t("marketing.screenshots.msg2")}
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
                {t("marketing.screenshots.msg3")}
              </div>
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                {t("marketing.screenshots.msg4")}
              </div>
            </div>
          </MockBrowserFrame>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">{t("marketing.screenshots.disclaimer")}</p>
      </section>

      {/* Why WhatsApp */}
      <section id="whatsapp" className="bg-muted/30 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <Badge variant="secondary" className="mb-4">{t("marketing.whatsapp.badge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight">{t("marketing.whatsapp.title")}</h2>
            <p className="mt-4 text-muted-foreground">{t("marketing.whatsapp.desc")}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {WHATSAPP_BULLETS.map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t(`marketing.whatsapp.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <MockBrowserFrame label={t("marketing.whatsapp.settingsLabel")}>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span>{t("marketing.whatsapp.aiAssistant")}</span>
                <Badge variant="success">{t("marketing.whatsapp.enabled")}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span>{t("marketing.whatsapp.dailyReminders")}</span>
                <Badge variant="success">{t("marketing.whatsapp.active")}</Badge>
              </div>
              <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                {t("marketing.whatsapp.webhookLabel")} <code className="text-xs">api.mbnhealth.com/whatsapp/webhook</code>
              </div>
            </div>
          </MockBrowserFrame>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t("marketing.pricing.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("marketing.pricing.subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <Card key={plan.id} className={plan.highlighted ? "relative border-primary shadow-lg" : undefined}>
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">{t("marketing.pricing.mostPopular")}</Badge>
              )}
              <CardHeader>
                <CardTitle>{t(`marketing.pricing.${PLAN_NAME_KEYS[plan.id]}`)}</CardTitle>
                <CardDescription>{t(`marketing.pricing.${PLAN_TAGLINE_KEYS[plan.id]}`)}</CardDescription>
                <p className="pt-2 text-3xl font-bold tracking-tight">
                  {plan.priceMad === null
                    ? t("marketing.pricing.customPricing")
                    : t("marketing.pricing.perMonth", { price: plan.priceMad })}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {PLAN_FEATURE_KEYS[plan.id].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {t(`marketing.pricing.${key}`)}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
                  {plan.priceMad === null ? (
                    <a href="mailto:contact@mbndev.ma?subject=Enterprise%20plan%20inquiry">{t("marketing.pricing.contactSales")}</a>
                  ) : (
                    <a href="#contact">{t("marketing.pricing.getStarted")}</a>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">{t("marketing.pricing.priceNote")}</p>
      </section>

      {/* Testimonials — placeholders, not real customer quotes yet */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="warning" className="mb-4">{t("marketing.testimonials.badge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight">{t("marketing.testimonials.title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("marketing.testimonials.subtitle")}</p>
          </div>
          <div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-3">
            {TESTIMONIAL_KEYS.map((key) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <p className="text-sm italic text-muted-foreground">{t(`marketing.testimonials.${key}Need`)}</p>
                  <p className="mt-4 text-sm font-medium">
                    {t("marketing.testimonials.attribution", {
                      role: t(`marketing.testimonials.${key}Role`).toLowerCase(),
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight">{t("marketing.faq.title")}</h2>
        <div className="mt-8 space-y-3">
          {FAQ_KEYS.map((key) => (
            <details key={key} className="group rounded-lg border border-border p-4 open:bg-muted/30">
              <summary className="cursor-pointer list-none text-sm font-medium">
                <span className="flex items-center justify-between">
                  {t(`marketing.faq.${key}`)}
                  <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{t(`marketing.faq.a${key.slice(1)}`)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact / Book demo */}
      <section id="contact" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
          <CardContent className="grid gap-8 p-8 sm:p-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t("marketing.contact.title")}</h2>
              <p className="mt-3 text-muted-foreground">{t("marketing.contact.subtitle")}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button size="lg" asChild>
                  <Link href="/register">{t("marketing.contact.tryDemo")}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:contact@mbndev.ma?subject=Book%20a%20demo">
                    <Mail className="h-4 w-4" /> contact@mbndev.ma
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="tel:+212601439975">
                    <Phone className="h-4 w-4" /> +212 601 439 975
                  </a>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {t("marketing.contact.forClinics")}
              </div>
              <div className="flex items-start gap-2.5">
                <Pill className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {t("marketing.contact.setupTime")}
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {t("marketing.contact.dataIsolated")}
              </div>
              <div className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {t("marketing.contact.whatsappHelp")}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium text-foreground">MBN Health</span>
          </div>
          <p>{t("marketing.footer.copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/about" className="hover:text-foreground">{t("marketing.footer.about")}</Link>
            <Link href="/contact" className="hover:text-foreground">{t("marketing.footer.contact")}</Link>
            <Link href="/privacy" className="hover:text-foreground">{t("patientPortal.footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-foreground">{t("patientPortal.footer.terms")}</Link>
            <Link href="/cookies" className="hover:text-foreground">{t("marketing.footer.cookies")}</Link>
            <Link href="/cancellation-policy" className="hover:text-foreground">{t("marketing.footer.cancellation")}</Link>
            <Link href="/login" className="hover:text-foreground">{t("marketing.nav.login")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
