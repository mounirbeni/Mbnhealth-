"use client";

import Link from "next/link";
import { CalendarDays, FileText, Pill, Receipt } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePortalAppointments } from "@/hooks/use-portal-data";
import { usePortalAuth } from "@/lib/portal-auth-context";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { formatDateTime } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "Appointments", href: "/portal/appointments", icon: CalendarDays },
  { label: "Medical Records", href: "/portal/medical-records", icon: FileText },
  { label: "Prescriptions", href: "/portal/prescriptions", icon: Pill },
  { label: "Invoices", href: "/portal/invoices", icon: Receipt },
];

export default function PortalHomePage() {
  const { patient } = usePortalAuth();
  const { data: appointments, isLoading } = usePortalAppointments();
  const upcoming = (appointments ?? [])
    .filter((a: any) => new Date(a.startTime) >= new Date() && a.status !== "CANCELLED")
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Welcome, {patient?.firstName}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s a quick look at your upcoming care.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <link.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming appointments</CardTitle>
          <CardDescription>Your next scheduled visits</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {isLoading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : upcoming.length > 0 ? (
            upcoming.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">
                    Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(a.startTime)}</p>
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[a.status] ?? "secondary"}>{a.status}</Badge>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">No upcoming appointments.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
