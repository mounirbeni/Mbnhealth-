"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePortalAppointments } from "@/hooks/use-portal-data";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { formatDateTime } from "@/lib/utils";

export default function PortalAppointmentsPage() {
  const { data: appointments, isLoading } = usePortalAppointments();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Appointments</h1>
        <p className="text-sm text-muted-foreground">All your visits, past and upcoming</p>
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : appointments && appointments.length > 0 ? (
              appointments.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell>{formatDateTime(a.startTime)}</TableCell>
                  <TableCell>
                    Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName}
                  </TableCell>
                  <TableCell>{a.department?.name ?? "—"}</TableCell>
                  <TableCell>{a.type}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[a.status] ?? "secondary"}>{a.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
