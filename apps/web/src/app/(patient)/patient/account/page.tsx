"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientAuth } from "@/lib/patient-auth-context";
import { useLocale } from "@/lib/i18n/locale-context";

export default function PatientAccountPage() {
  const { patient, isLoading, logout } = usePatientAuth();
  const { t } = useLocale();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-sm space-y-6 py-4">
        <Skeleton className="h-8 w-40" />
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 border-t border-border/60 pt-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-sm space-y-4 py-8 text-center">
        <h1 className="text-xl font-bold tracking-tight">{t("patientPortal.account.loggedOutTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("patientPortal.account.loggedOutSubtitle")}</p>
        <div className="flex flex-col gap-2 pt-2">
          <Button asChild>
            <Link href="/patient/login?next=/patient/account">{t("common.signIn")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/patient/register">{t("patientPortal.nav.createAccount")}</Link>
          </Button>
        </div>
        <LegalLinks />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-4">
      <h1 className="text-2xl font-bold tracking-tight">{t("patientPortal.account.title")}</h1>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {patient.firstName[0]}
              {patient.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">
              {patient.firstName} {patient.lastName}
            </CardTitle>
            <p className="truncate text-sm text-muted-foreground">{patient.email}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 border-t border-border/60 pt-4">
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/patient/appointments">{t("patientPortal.account.viewAppointments")}</Link>
          </Button>
          <Button variant="outline" className="justify-start text-destructive hover:text-destructive" onClick={logout}>
            <LogOut className="h-4 w-4" /> {t("common.signOut")}
          </Button>
        </CardContent>
      </Card>

      <LegalLinks />
    </div>
  );
}

// The footer (with these same links) is hidden on mobile in favor of the
// bottom tab bar — surface them here instead so they're not unreachable.
function LegalLinks() {
  const { t } = useLocale();
  return (
    <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground sm:hidden">
      <Link href="/privacy" className="hover:text-foreground">
        {t("patientPortal.footer.privacy")}
      </Link>
      <Link href="/terms" className="hover:text-foreground">
        {t("patientPortal.footer.terms")}
      </Link>
    </div>
  );
}
