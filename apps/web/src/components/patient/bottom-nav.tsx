"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, User } from "lucide-react";
import { usePatientAuth } from "@/lib/patient-auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PatientBottomNav() {
  const pathname = usePathname();
  const { patient } = usePatientAuth();
  const { t } = useLocale();

  const tabs = [
    { href: "/", label: t("patientPortal.nav.home"), icon: Home },
    { href: "/find-a-clinic", label: t("patientPortal.nav.findClinic"), icon: Search },
    { href: "/patient/appointments", label: t("patientPortal.nav.appointmentsShort"), icon: CalendarDays },
    {
      href: patient ? "/patient/account" : "/patient/login",
      label: patient ? t("patientPortal.nav.account") : t("common.signIn"),
      icon: User,
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-5xl items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-primary/10")} strokeWidth={active ? 2.25 : 2} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
