"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HeartPulse, LayoutDashboard, CalendarDays, FileText, Pill, Receipt, FlaskConical, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePortalAuth } from "@/lib/portal-auth-context";
import { cn, initials } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/portal", icon: LayoutDashboard },
  { label: "Appointments", href: "/portal/appointments", icon: CalendarDays },
  { label: "Medical Records", href: "/portal/medical-records", icon: FileText },
  { label: "Prescriptions", href: "/portal/prescriptions", icon: Pill },
  { label: "Invoices", href: "/portal/invoices", icon: Receipt },
  { label: "Lab & Radiology", href: "/portal/lab-results", icon: FlaskConical },
];

export default function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const { patient, isLoading, logout } = usePortalAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !patient) {
      router.replace("/portal/login");
    }
  }, [isLoading, patient, router]);

  if (isLoading || !patient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Patient Portal</span>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur">
          <span className="text-sm font-medium lg:hidden">Patient Portal</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{initials(patient.firstName, patient.lastName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {patient.firstName} {patient.lastName}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="scrollbar-thin flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
