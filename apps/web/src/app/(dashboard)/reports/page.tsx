"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { DollarSign, Users, Stethoscope, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const revenue = useRevenueReport();
  const appointments = useAppointmentsReport();
  const patients = usePatientsReport();
  const doctors = useDoctorsReport();
  const financial = useFinancialReport();
  const inventory = useInventoryReport();

  const appointmentStatusData = appointments.data
    ? Object.entries(appointments.data.byStatus).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Revenue, operations and performance insights</p>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="flex-wrap">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="flex items-center justify-between">
            <StatCard label="Total Revenue (last 30 days)" value={formatCurrency(revenue.data?.total ?? 0)} icon={DollarSign} />
            <Button variant="outline" size="sm" onClick={() => downloadReportCsv("revenue")}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="flex items-center justify-between">
            <StatCard label="Total Appointments (last 30 days)" value={appointments.data?.total ?? 0} icon={Users} />
            <Button variant="outline" size="sm" onClick={() => downloadReportCsv("appointments")}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Appointments by status</CardTitle>
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
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="flex items-center justify-between">
            <StatCard label="Total Patients" value={patients.data?.total ?? 0} icon={Users} />
            <Button variant="outline" size="sm" onClick={() => downloadReportCsv("patients")}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <StatCard label="Active Doctors" value={doctors.data?.length ?? 0} icon={Stethoscope} />
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {doctors.data?.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.department ?? "General"}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{d.appointments} appointments</p>
                    <p>{d.consultations} consultations</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Revenue" value={formatCurrency(financial.data?.revenue ?? 0)} icon={DollarSign} />
            <StatCard label="Outstanding" value={formatCurrency(financial.data?.outstanding ?? 0)} icon={DollarSign} accent="warning" />
            <StatCard label="Insurance Claimed" value={formatCurrency(financial.data?.insuranceClaimed ?? 0)} icon={DollarSign} />
            <StatCard label="Insurance Approved" value={formatCurrency(financial.data?.insuranceApproved ?? 0)} icon={DollarSign} accent="success" />
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Items" value={inventory.data?.totalItems ?? 0} icon={Package} />
            <StatCard label="Low Stock" value={inventory.data?.lowStockCount ?? 0} icon={Package} accent="destructive" />
            <StatCard label="Total Value" value={formatCurrency(inventory.data?.totalValue ?? 0)} icon={DollarSign} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
