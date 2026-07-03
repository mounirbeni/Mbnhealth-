"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "outline"> = {
  CREATE: "success",
  UPDATE: "secondary",
  DELETE: "destructive",
  LOGIN: "default",
  LOGOUT: "outline",
  LOGIN_FAILED: "destructive",
  EXPORT: "warning",
  VIEW_SENSITIVE: "warning",
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => api.get<{ items: any[]; total: number; page: number; pageSize: number }>(`/audit-logs?page=${page}&pageSize=25`),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">A complete record of security-relevant actions in your clinic</p>
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data && data.items.length > 0 ? (
              data.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant={ACTION_VARIANT[log.action] ?? "secondary"} className="gap-1">
                      <ShieldCheck className="h-3 w-3" /> {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.entityType}
                    {log.entityId && <span className="text-xs text-muted-foreground"> · {log.entityId.slice(0, 8)}</span>}
                  </TableCell>
                  <TableCell>{log.user ? `${log.user.firstName} ${log.user.lastName}` : "System"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.ipAddress ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No audit events yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
