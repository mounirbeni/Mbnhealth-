"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarCheck, DollarSign, Users, Stethoscope, FlaskConical, PackageX } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useAppointmentsTrend,
  useDashboardOverview,
  useDoctorPerformance,
  useRevenueTrend,
  useUpcomingAppointments,
} from "@/hooks/use-dashboard";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatDateTime, initials } from "@/lib/utils";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { useLocale } from "@/lib/i18n/locale-context";
import { INTL_LOCALE_TAGS } from "@/lib/i18n/locales";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: overview, isLoading } = useDashboardOverview();
  const { data: revenueTrend } = useRevenueTrend(6);
  const { data: appointmentsTrend } = useAppointmentsTrend(14);
  const { data: upcoming } = useUpcomingAppointments(6);
  const { data: doctorPerformance } = useDoctorPerformance();
  const { t, locale } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title">
          {t("dashboard.overview.welcomeBack", { name: user?.firstName ?? "" })} 👋
        </h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.overview.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.overview.todaysAppointments")}
          value={overview?.todayAppointmentsTotal ?? 0}
          isLoading={isLoading}
          icon={CalendarCheck}
          accent="primary"
          className="animate-fade-in-up [animation-fill-mode:backwards] [animation-delay:0ms]"
        />
        <StatCard
          label={t("dashboard.overview.revenueThisMonth")}
          value={formatCurrency(overview?.revenueThisMonth ?? 0)}
          isLoading={isLoading}
          icon={DollarSign}
          accent="success"
          className="animate-fade-in-up [animation-fill-mode:backwards] [animation-delay:60ms]"
        />
        <StatCard
          label={t("dashboard.overview.activePatients")}
          value={overview?.totalPatients ?? 0}
          isLoading={isLoading}
          icon={Users}
          accent="primary"
          className="animate-fade-in-up [animation-fill-mode:backwards] [animation-delay:120ms]"
        />
        <StatCard
          label={t("dashboard.overview.doctorsOnStaff")}
          value={overview?.totalDoctors ?? 0}
          isLoading={isLoading}
          icon={Stethoscope}
          accent="primary"
          className="animate-fade-in-up [animation-fill-mode:backwards] [animation-delay:180ms]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.overview.outstandingBalance")}
          value={formatCurrency(overview?.outstandingBalance ?? 0)}
          isLoading={isLoading}
          icon={DollarSign}
          accent="warning"
          className="animate-fade-in-up [animation-fill-mode:backwards] [animation-delay:240ms]"
        />
        <StatCard
          label={t("dashboard.overview.pendingLabOrders")}
          value={overview?.pendingLabOrders ?? 0}
          isLoading={isLoading}
          icon={FlaskConical}
          accent="warning"
          className="animate-fade-in-up [animation-fill-mode:backwards] [animation-delay:300ms]"
        />
        <StatCard
          label={t("dashboard.overview.lowStockItems")}
          value={overview?.lowStockItemsCount ?? 0}
          isLoading={isLoading}
          icon={PackageX}
          accent="destructive"
          className="animate-fade-in-up [animation-fill-mode:backwards] [animation-delay:360ms]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="surface-card-hover lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.overview.revenueTrend")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend ?? []}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 8, fontSize: 13, border: "1px solid hsl(var(--border))" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="surface-card-hover">
          <CardHeader>
            <CardTitle>{t("dashboard.overview.upcomingAppointments")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming && upcoming.length > 0 ? (
              upcoming.map((appt) => (
                <div key={appt.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials(appt.patient.firstName, appt.patient.lastName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {appt.patient.firstName} {appt.patient.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t("patientPortal.clinicProfile.doctorTitle", {
                        name: `${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`,
                      })}{" "}
                      · {formatDateTime(appt.startTime)}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANT[appt.status] ?? "secondary"}>
                    {t(`appointmentStatus.${appt.status}`)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.overview.noUpcoming")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="surface-card-hover">
          <CardHeader>
            <CardTitle>{t("dashboard.overview.appointmentsLast14")}</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentsTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString(INTL_LOCALE_TAGS[locale], { day: "numeric", month: "short" })}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="surface-card-hover">
          <CardHeader>
            <CardTitle>{t("dashboard.overview.doctorPerformance")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {doctorPerformance && doctorPerformance.length > 0 ? (
              doctorPerformance
                .sort((a, b) => b.appointmentsCount - a.appointmentsCount)
                .map((d) => (
                  <div key={d.doctorId} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-muted-foreground">
                      {t("dashboard.overview.appointmentsCount", { count: d.appointmentsCount })}
                    </span>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.overview.noDataYet")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
