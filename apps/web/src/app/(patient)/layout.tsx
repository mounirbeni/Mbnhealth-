"use client";

import Link from "next/link";
import { Activity, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PatientAuthProvider, usePatientAuth } from "@/lib/patient-auth-context";
import { useLocale } from "@/lib/i18n/locale-context";

function PatientNav() {
  const { patient, isLoading, logout } = usePatientAuth();
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">MBN Health</span>
          <span className="hidden rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground sm:inline">
            {t("patientPortal.nav.badge")}
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/find-a-clinic">{t("patientPortal.nav.findClinic")}</Link>
          </Button>
          {!isLoading && patient ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/patient/appointments">{t("patientPortal.nav.myAppointments")}</Link>
              </Button>
              <div className="flex items-center gap-2 pl-1">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={logout}>
                  {t("common.signOut")}
                </Button>
              </div>
            </>
          ) : (
            !isLoading && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/patient/login">{t("common.signIn")}</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/patient/register">{t("patientPortal.nav.createAccount")}</Link>
                </Button>
              </>
            )
          )}
          <LanguageSwitcher size="icon" />
        </nav>
      </div>
    </header>
  );
}

function PatientFooter() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-border/60 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <div className="flex items-center gap-1.5">
          <HeartPulse className="h-3.5 w-3.5" />
          <span>{t("patientPortal.footer.tagline")}</span>
        </div>
        <p>{t("patientPortal.footer.dataNotice")}</p>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="hover:text-foreground">
            {t("patientPortal.footer.privacy")}
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            {t("patientPortal.footer.terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientAuthProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <PatientNav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <PatientFooter />
      </div>
    </PatientAuthProvider>
  );
}
