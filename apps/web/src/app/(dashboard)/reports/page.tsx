"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, DollarSign, Users, Stethoscope, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  downloadReportCsv,
  useAppointmentsReport,
  useDoctorsReport,
  useFinancialReport,
  useInventoryReport,
  usePatientsReport,
  useRevenueReport,
} from "@/hooks/use-reports";
import { useRevenueTrend, useAppointmentsTrend } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import { INTL_LOCALE_TAGS } from "@/lib/i18n/locales";

const RANGE_DAYS = { "7": 7, "30": 30, "90": 90, "180": 180 } as const;
type RangeKey = keyof typeof RANGE_DAYS;

function useDateRange(rangeKey: RangeKey) {
  return useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - RANGE_DAYS[rangeKey]);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [rangeKey]);
}

function RangeSelector({ value, onChange }: { value: RangeKey; onChange: (v: RangeKey) => void }) {
  const { t } = useLocale();
  return (
    <Select value={value} onValueChange={(v) => onChange(v as RangeKey)}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">{t("dashboard.reports.last7Days")}</SelectItem>
        <SelectItem value="30">{t("dashboard.reports.last30Days")}</SelectItem>
        <SelectItem value="90">{t("dashboard.reports.last90Days")}</SelectItem>
        <SelectItem value="180">{t("dashboard.reports.last180Days")}</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function ReportsPage() {
  const { t, locale } = useLocale();
  const [rangeKey, setRangeKey] = useState<RangeKey>("30");
  const range = useDateRange(rangeKey);

  const revenue = useRevenueReport(range);
  const appointments = useAppointmentsReport(range);
  const patients = usePatientsReport();
  const doctors = useDoctorsReport();
  const financial = useFinancialReport(range);
  const inventory = useInventoryReport();
  const { data: revenueTrend } = useRevenueTrend(6);
  const { data: appointmentsTrend } = useAppointmentsTrend(14);

  const appointmentStatusData = appointments.data
    ? Object.entries(appointments.data.byStatus).map(([status, count]) => ({ status, count }))
    : [];

  const sortedDoctors = useMemo(
    () => [...(doctors.data ?? [])].sort((a, b) => b.appointments - a.appointments),
    [doctors.data],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-page-title">{t("dashboard.reports.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.reports.subtitle")}</p>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="flex-wrap">
          <TabsTrigger value="revenue">{t("dashboard.reports.revenueTab")}</TabsTrigger>
          <TabsTrigger value="appointments">{t("dashboard.reports.appointmentsTab")}</TabsTrigger>
          <TabsTrigger value="patients">{t("dashboard.reports.patientsTab")}</TabsTrigger>
          <TabsTrigger value="doctors">{t("dashboard.reports.doctorsTab")}</TabsTrigger>
          <TabsTrigger value="financial">{t("dashboard.reports.financialTab")}</TabsTrigger>
          <TabsTrigger value="inventory">{t("dashboard.reports.inventoryTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatCard label={t("dashboard.reports.totalRevenue30")} value={formatCurrency(revenue.data?.total ?? 0)} icon={DollarSign} />
            <div className="flex items-center gap-2">
              <RangeSelector value={rangeKey} onChange={setRangeKey} />
              <Button variant="outline" size="sm" onClick={() => downloadReportCsv("revenue")}>
                <Download className="h-3.5 w-3.5" /> {t("dashboard.reports.exportCsv")}
              </Button>
            </div>
          </div>
          <Card className="surface-card-hover">
            <CardHeader>
              <CardTitle>{t("dashboard.overview.revenueTrend")}</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend ?? []}>
                  <defs>
                    <linearGradient id="reportsRevenueGradient" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#reportsRevenueGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatCard label={t("dashboard.reports.totalAppointments30")} value={appointments.data?.total ?? 0} icon={Users} />
            <div className="flex items-center gap-2">
              <RangeSelector value={rangeKey} onChange={setRangeKey} />
              <Button variant="outline" size="sm" onClick={() => downloadReportCsv("appointments")}>
                <Download className="h-3.5 w-3.5" /> {t("dashboard.reports.exportCsv")}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="surface-card-hover">
              <CardHeader>
                <CardTitle>{t("dashboard.reports.appointmentsByStatus")}</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentStatusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="status" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13, border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
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
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="flex items-center justify-between">
            <StatCard label={t("dashboard.reports.totalPatients")} value={patients.data?.total ?? 0} icon={Users} />
            <Button variant="outline" size="sm" onClick={() => downloadReportCsv("patients")}>
              <Download className="h-3.5 w-3.5" /> {t("dashboard.reports.exportCsv")}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <StatCard label={t("dashboard.reports.activeDoctors")} value={doctors.data?.length ?? 0} icon={Stethoscope} />
          <Card className="surface-card-hover">
            <CardContent className="divide-y divide-border p-0">
              {sortedDoctors.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.department ?? t("dashboard.reports.generalDept")}</p>
                  </div>
                  <div className="text-end text-xs text-muted-foreground">
                    <p>{t("dashboard.reports.appointmentsCount", { count: d.appointments })}</p>
                    <p>{t("dashboard.reports.consultationsCount", { count: d.consultations })}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="flex items-center justify-end">
            <RangeSelector value={rangeKey} onChange={setRangeKey} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t("dashboard.reports.revenue")} value={formatCurrency(financial.data?.revenue ?? 0)} icon={DollarSign} />
            <StatCard
              label={t("dashboard.reports.outstanding")}
              value={formatCurrency(financial.data?.outstanding ?? 0)}
              icon={DollarSign}
              accent="warning"
            />
            <StatCard
              label={t("dashboard.reports.insuranceClaimed")}
              value={formatCurrency(financial.data?.insuranceClaimed ?? 0)}
              icon={DollarSign}
            />
            <StatCard
              label={t("dashboard.reports.insuranceApproved")}
              value={formatCurrency(financial.data?.insuranceApproved ?? 0)}
              icon={DollarSign}
              accent="success"
            />
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label={t("dashboard.reports.totalItems")} value={inventory.data?.totalItems ?? 0} icon={Package} />
            <StatCard
              label={t("dashboard.reports.lowStock")}
              value={inventory.data?.lowStockCount ?? 0}
              icon={Package}
              accent="destructive"
            />
            <StatCard label={t("dashboard.reports.totalValue")} value={formatCurrency(inventory.data?.totalValue ?? 0)} icon={DollarSign} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
