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
import { PRICING_PLANS, formatPlanPrice } from "@/lib/pricing";

const FEATURES = [
  {
    icon: Stethoscope,
    title: "Patients & EHR",
    desc: "Full medical history, allergies, medications, vitals and SOAP notes — all in one chart.",
  },
  {
    icon: CalendarDays,
    title: "Smart scheduling",
    desc: "Day/week/month calendar with drag-to-reschedule, waitlists and no-show tracking.",
  },
  {
    icon: MessageCircle,
    title: "Real WhatsApp integration",
    desc: "Automated appointment reminders and patient conversations on the app your patients already use.",
  },
  {
    icon: Bot,
    title: "AI front-desk assistant",
    desc: "Answers clinic FAQs and looks up a patient's own appointments over WhatsApp — 24/7, no extra staff.",
  },
  {
    icon: ClipboardList,
    title: "Billing & invoicing",
    desc: "Invoices, payments and insurance claims, reconciled against every appointment automatically.",
  },
  {
    icon: BarChart3,
    title: "Reports & analytics",
    desc: "Occupancy, revenue and no-show trends your clinic manager can act on the same day.",
  },
  {
    icon: Users,
    title: "Role-based staff access",
    desc: "Owners, managers, doctors, receptionists and accountants each see exactly what they need.",
  },
  {
    icon: ShieldCheck,
    title: "Built on real security",
    desc: "Argon2 password hashing, MFA, full audit trail, and strict per-clinic data isolation.",
  },
];

const FAQS = [
  {
    q: "Do our patients need to install anything?",
    a: "No. Reminders and conversations happen on WhatsApp, which most patients already have installed — there's nothing new for them to download.",
  },
  {
    q: "What does the AI assistant actually do?",
    a: "It answers general clinic questions (hours, address, phone) and looks up the matched patient's own upcoming appointments. It never books, cancels, or gives medical advice — anything else is handed to your staff.",
  },
  {
    q: "Can we switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time from Settings → Billing — your data and history are never affected.",
  },
  {
    q: "Is our clinic's data isolated from other clinics?",
    a: "Yes. Every clinic is a fully isolated tenant — no shared database rows, no cross-clinic queries are possible.",
  },
  {
    q: "Can we host it ourselves instead of the cloud version?",
    a: "Yes, self-hosting via Docker or Kubernetes is supported for clinics or groups that need to keep infrastructure in-house.",
  },
  {
    q: "Is there a contract or can we cancel anytime?",
    a: "Monthly billing, cancel anytime from the Billing Portal — no long-term contract required on Starter or Professional.",
  },
];

function MockBrowserFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
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
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#whatsapp" className="hover:text-foreground">WhatsApp</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/find-a-clinic">Find a clinic</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <a href="#contact">Book a demo</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-5">Built for clinics, not IT departments</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Run your clinic. <span className="text-primary">Not your spreadsheets.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              MBN Health replaces the paper calendar, the Excel invoices, and the manual WhatsApp reminders with one
              platform — patients, appointments, billing and communication, in one place. You&apos;re not buying
              software, you&apos;re buying back hours of your week.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/login?clinic=demo-clinic">Try the live demo</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">Book a demo</a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">No install. No credit card. Click straight into a seeded demo clinic.</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Looking for a doctor instead?{" "}
              <Link href="/find-a-clinic" className="font-medium text-primary hover:underline">
                Find a clinic and book an appointment
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Product demo mockup */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <MockBrowserFrame label="app.mbnhealth.com/dashboard">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="sm:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Today&apos;s appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {["09:00 — Aicha B. · Dr. Hicham", "09:30 — Youssef K. · Dr. Hicham", "10:15 — Salma T. · Dr. Nadia"].map(
                  (row) => (
                    <div key={row} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                      <span>{row}</span>
                      <Badge variant="success">Confirmed</Badge>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">This month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-semibold">312</p>
                  <p className="text-xs text-muted-foreground">Patients seen</p>
                </div>
                <SkeletonBar className="h-16 w-full" />
                <div className="flex items-center gap-1 text-xs text-success">
                  <BadgeCheck className="h-3.5 w-3.5" /> No-shows down 18%
                </div>
              </CardContent>
            </Card>
          </div>
        </MockBrowserFrame>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything a clinic runs on, in one system</h2>
          <p className="mt-3 text-muted-foreground">
            Not a stripped-down demo — real scheduling logic, real billing math, and a real audit trail underneath.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Screenshots */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <MockBrowserFrame label="Appointments — week view">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <SkeletonBar key={i} className={i % 3 === 0 ? "h-16 bg-primary/20" : "h-16"} />
              ))}
            </div>
          </MockBrowserFrame>
          <MockBrowserFrame label="WhatsApp — patient conversation">
            <div className="space-y-2.5">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
                Hi, what time is the clinic open on Saturday?
              </div>
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                We&apos;re open Saturdays 9am–1pm. Would you like to book an appointment?
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
                What time is my next appointment?
              </div>
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                Your next appointment is Thursday at 10:30 with Dr. Hicham.
              </div>
            </div>
          </MockBrowserFrame>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Illustrative product mockups — replace with real product screenshots before launch.
        </p>
      </section>

      {/* Why WhatsApp */}
      <section id="whatsapp" className="bg-muted/30 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <Badge variant="secondary" className="mb-4">Why WhatsApp</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Your patients already have it open.</h2>
            <p className="mt-4 text-muted-foreground">
              Clinics lose hours a day to phone tag and forgotten appointments. MBN Health talks to patients where
              they already are — no new app to explain, no login to reset.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Automatic appointment reminders, sent the day before",
                "Real Meta WhatsApp Business Cloud API — not a third-party workaround",
                "An AI assistant that answers routine questions instantly, day or night",
                "Every message logged against the patient's record for your front desk",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <MockBrowserFrame label="Settings → WhatsApp Bot">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span>AI assistant</span>
                <Badge variant="success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span>Daily reminders</span>
                <Badge variant="success">Active — 08:00</Badge>
              </div>
              <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                Webhook: <code className="text-xs">api.mbnhealth.com/whatsapp/webhook</code>
              </div>
            </div>
          </MockBrowserFrame>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Pricing that matches your clinic&apos;s size</h2>
          <p className="mt-3 text-muted-foreground">Simple monthly plans. No setup fees. Cancel anytime.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <Card key={plan.id} className={plan.highlighted ? "relative border-primary shadow-lg" : undefined}>
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.tagline}</CardDescription>
                <p className="pt-2 text-3xl font-bold tracking-tight">{formatPlanPrice(plan)}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
                  {plan.priceMad === null ? (
                    <a href="mailto:sales@mbnhealth.com?subject=Enterprise%20plan%20inquiry">Contact sales</a>
                  ) : (
                    <a href="#contact">Get started</a>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Prices shown in Moroccan Dirham (MAD), billed monthly.</p>
      </section>

      {/* Testimonials — placeholders, not real customer quotes yet */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="warning" className="mb-4">Early access</Badge>
            <h2 className="text-3xl font-bold tracking-tight">We&apos;re onboarding our first clinics</h2>
            <p className="mt-3 text-muted-foreground">
              MBN Health is in early access — real testimonials will go here once our first clinics have used the
              platform. Below is the kind of feedback we&apos;re building for.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { role: "Clinic owner", need: "“I want to stop losing patients to no-shows.”" },
              { role: "Receptionist", need: "“I want one screen instead of three apps.”" },
              { role: "Doctor", need: "“I want my notes and prescriptions in one chart.”" },
            ].map((t) => (
              <Card key={t.role}>
                <CardContent className="pt-6">
                  <p className="text-sm italic text-muted-foreground">{t.need}</p>
                  <p className="mt-4 text-sm font-medium">— A problem real {t.role.toLowerCase()}s tell us about</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((item) => (
            <details key={item.q} className="group rounded-lg border border-border p-4 open:bg-muted/30">
              <summary className="cursor-pointer list-none text-sm font-medium">
                <span className="flex items-center justify-between">
                  {item.q}
                  <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact / Book demo */}
      <section id="contact" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
          <CardContent className="grid gap-8 p-8 sm:p-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Book a demo</h2>
              <p className="mt-3 text-muted-foreground">
                Tell us about your clinic and we&apos;ll walk you through MBN Health live — or just try the demo
                yourself right now.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/login?clinic=demo-clinic">Try the live demo</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:sales@mbnhealth.com?subject=Book%20a%20demo">
                    <Phone className="h-4 w-4" /> sales@mbnhealth.com
                  </a>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                For clinics, groups and hospitals
              </div>
              <div className="flex items-start gap-2.5">
                <Pill className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Setup usually takes under a day
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Your data stays isolated to your clinic
              </div>
              <div className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                We help configure WhatsApp for you
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
          <p>© {new Date().getFullYear()} MBN Health. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="mailto:sales@mbnhealth.com" className="hover:text-foreground">Contact</a>
            <Link href="/login" className="hover:text-foreground">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
