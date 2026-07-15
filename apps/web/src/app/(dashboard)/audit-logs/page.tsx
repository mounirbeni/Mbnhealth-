"use client";

import { useState } from "react";
import { Eye, ShieldCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuditLogs, type AuditLogEntry } from "@/hooks/use-audit-logs";
import { useStaff } from "@/hooks/use-users";
import { formatDateTime } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

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
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState("");
  const [userId, setUserId] = useState<string | undefined>();
  const [detailLog, setDetailLog] = useState<AuditLogEntry | null>(null);
  const { data, isLoading } = useAuditLogs({ page, pageSize: 25, entityType: entityType || undefined, userId });
  const { data: staff } = useStaff();

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-page-title">{t("dashboard.auditLogs.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.auditLogs.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t("dashboard.auditLogs.filterEntityPlaceholder")}
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setPage(1);
          }}
          className="max-w-[220px]"
        />
        <Select
          value={userId ?? "all"}
          onValueChange={(v) => {
            setUserId(v === "all" ? undefined : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="max-w-[220px]">
            <SelectValue placeholder={t("dashboard.auditLogs.filterUserPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dashboard.auditLogs.allUsers")}</SelectItem>
            {staff?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="surface-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dashboard.auditLogs.colAction")}</TableHead>
              <TableHead>{t("dashboard.auditLogs.colEntity")}</TableHead>
              <TableHead>{t("dashboard.auditLogs.colUser")}</TableHead>
              <TableHead>{t("dashboard.auditLogs.colIp")}</TableHead>
              <TableHead>{t("dashboard.auditLogs.colTimestamp")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
                  <TableCell>
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : t("dashboard.auditLogs.systemUser")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.ipAddress ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setDetailLog(log)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {t("dashboard.auditLogs.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t("dashboard.auditLogs.page", { page, totalPages })}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("dashboard.auditLogs.previous")}
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {t("dashboard.auditLogs.next")}
          </Button>
        </div>
      </div>

      <Sheet open={!!detailLog} onOpenChange={(open) => !open && setDetailLog(null)}>
        <SheetContent side="end">
          {detailLog && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Badge variant={ACTION_VARIANT[detailLog.action] ?? "secondary"}>{detailLog.action}</Badge>
                  {detailLog.entityType}
                </SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("dashboard.auditLogs.colUser")}</p>
                  <p className="font-medium">
                    {detailLog.user ? `${detailLog.user.firstName} ${detailLog.user.lastName}` : t("dashboard.auditLogs.systemUser")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("dashboard.auditLogs.colIp")}</p>
                  <p className="font-medium">{detailLog.ipAddress ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("dashboard.auditLogs.colTimestamp")}</p>
                  <p className="font-medium">{formatDateTime(detailLog.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("dashboard.auditLogs.colEntity")}</p>
                  <p className="font-medium">{detailLog.entityId ?? "—"}</p>
                </div>
              </div>
              {detailLog.metadata && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("dashboard.auditLogs.metadata")}</p>
                  <pre className="mt-1 max-h-96 overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs">
                    {JSON.stringify(detailLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
