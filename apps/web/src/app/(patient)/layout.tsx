"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientAuthProvider, usePatientAuth } from "@/lib/patient-auth-context";

function PatientNav() {
  const { patient, isLoading, logout } = usePatientAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/find-a-clinic" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">MBN Health</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/find-a-clinic">Find a clinic</Link>
          </Button>
          {!isLoading && patient ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/patient/appointments">My appointments</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            !isLoading && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/patient/login">Sign in</Link>
              </Button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientAuthProvider>
      <div className="min-h-screen bg-background">
        <PatientNav />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </PatientAuthProvider>
  );
}
