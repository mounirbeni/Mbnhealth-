"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAdminTenants, useSetTenantStatus, type TenantStatus } from "@/hooks/use-admin-tenants";
import { ApiError } from "@/lib/api-client";

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

const STATUS_VARIANT: Record<TenantStatus, "success" | "warning" | "secondary"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  ARCHIVED: "secondary",
};

export default function PlatformAdminPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);
  const pageSize = 25;

  const { data, isLoading } = useAdminTenants({ search: debouncedSearch, page, pageSize });
  const setStatus = useSetTenantStatus();

  const onSetStatus = async (id: string, name: string, status: TenantStatus) => {
    try {
      await setStatus.mutateAsync({ id, status });
      toast.success(`${name} is now ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update tenant status");
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clinics on the platform</h1>
        <p className="text-sm text-muted-foreground">
          Every clinic tenant registered on MBN Health — search, review subscription status, and suspend or restore
          access.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clinics by name..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {data ? `${data.total} clinic${data.total === 1 ? "" : "s"}` : "Clinics"}
          </CardTitle>
          <CardDescription>Plan, subscription status, and usage at a glance.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Building2 className="h-8 w-8" />
              <p>No clinics match your search.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {tenant.slug}
                        {tenant.city ? ` · ${tenant.city}` : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{tenant.subscription?.plan ?? "—"}</span>
                      <div className="text-xs text-muted-foreground">{tenant.subscription?.status ?? ""}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[tenant.status]}>{tenant.status}</Badge>
                    </TableCell>
                    <TableCell>{tenant._count.users}</TableCell>
                    <TableCell>{tenant._count.patients}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {tenant.status !== "ACTIVE" && (
                            <DropdownMenuItem onClick={() => onSetStatus(tenant.id, tenant.name, "ACTIVE")}>
                              Activate
                            </DropdownMenuItem>
                          )}
                          {tenant.status !== "SUSPENDED" && (
                            <DropdownMenuItem onClick={() => onSetStatus(tenant.id, tenant.name, "SUSPENDED")}>
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {tenant.status !== "ARCHIVED" && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onSetStatus(tenant.id, tenant.name, "ARCHIVED")}
                            >
                              Archive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {data && data.total > pageSize && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {data.page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
