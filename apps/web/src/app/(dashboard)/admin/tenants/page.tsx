"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminTenants, useSetTenantStatus } from "@/hooks/use-admin-tenants";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

export default function AdminTenantsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminTenants({ search });
  const setStatus = useSetTenantStatus();

  const changeStatus = async (id: string, status: "ACTIVE" | "SUSPENDED" | "ARCHIVED") => {
    try {
      await setStatus.mutateAsync({ id, status });
      toast.success(`Clinic ${status === "ACTIVE" ? "reactivated" : status.toLowerCase()}`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to update clinic status");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Clinics</h1>
        <p className="text-sm text-muted-foreground">Every clinic registered on the platform</p>
      </div>

      <Input
        placeholder="Search clinics..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clinic</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Patients</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.items && data.items.length > 0 ? (
              data.items.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <div>{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{t.subscription?.plan ?? "—"}</TableCell>
                  <TableCell>{t._count?.users ?? 0}</TableCell>
                  <TableCell>{t._count?.patients ?? 0}</TableCell>
                  <TableCell>{formatDate(t.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[t.status] ?? "secondary"}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    {t.status !== "ACTIVE" && (
                      <Button size="sm" variant="outline" onClick={() => changeStatus(t.id, "ACTIVE")}>
                        Reactivate
                      </Button>
                    )}
                    {t.status !== "SUSPENDED" && (
                      <Button size="sm" variant="outline" onClick={() => changeStatus(t.id, "SUSPENDED")}>
                        Suspend
                      </Button>
                    )}
                    {t.status !== "ARCHIVED" && (
                      <Button size="sm" variant="outline" onClick={() => changeStatus(t.id, "ARCHIVED")}>
                        Archive
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No clinics found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
