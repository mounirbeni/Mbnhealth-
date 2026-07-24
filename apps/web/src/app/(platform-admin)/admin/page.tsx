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
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminTenants, useSetTenantStatus, type TenantStatus } from "@/hooks/use-admin-tenants";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";
import { INTL_LOCALE_TAGS } from "@/lib/i18n/locales";

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
  const { t, locale } = useLocale();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);
  const pageSize = 25;

  const { data, isLoading } = useAdminTenants({ search: debouncedSearch, page, pageSize });
  const setStatus = useSetTenantStatus();

  const onSetStatus = async (id: string, name: string, status: TenantStatus) => {
    try {
      await setStatus.mutateAsync({ id, status });
      toast.success(t("admin.statusUpdatedToast", { name, status: t(`tenantStatus.${status}`) }));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("admin.statusUpdateFailedToast"));
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title">{t("admin.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.subtitle")}</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("admin.searchPlaceholder")}
          className="ps-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="text-base">
            {data
              ? data.total === 1
                ? t("admin.clinicCountSingular")
                : t("admin.clinicCount", { count: data.total })
              : t("admin.clinicsFallback")}
          </CardTitle>
          <CardDescription>{t("admin.tableSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <EmptyState icon={Building2} title={t("admin.noResults")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.colClinic")}</TableHead>
                  <TableHead>{t("admin.colPlan")}</TableHead>
                  <TableHead>{t("admin.colStatus")}</TableHead>
                  <TableHead>{t("admin.colStaff")}</TableHead>
                  <TableHead>{t("admin.colPatients")}</TableHead>
                  <TableHead>{t("admin.colCreated")}</TableHead>
                  <TableHead className="text-end">{t("admin.colActions")}</TableHead>
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
                      <Badge variant={STATUS_VARIANT[tenant.status]}>{t(`tenantStatus.${tenant.status}`)}</Badge>
                    </TableCell>
                    <TableCell>{tenant._count.users}</TableCell>
                    <TableCell>{tenant._count.patients}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tenant.createdAt).toLocaleDateString(INTL_LOCALE_TAGS[locale])}
                    </TableCell>
                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            {t("admin.manage")}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {tenant.status !== "ACTIVE" && (
                            <DropdownMenuItem onClick={() => onSetStatus(tenant.id, tenant.name, "ACTIVE")}>
                              {t("admin.activate")}
                            </DropdownMenuItem>
                          )}
                          {tenant.status !== "SUSPENDED" && (
                            <DropdownMenuItem onClick={() => onSetStatus(tenant.id, tenant.name, "SUSPENDED")}>
                              {t("admin.suspend")}
                            </DropdownMenuItem>
                          )}
                          {tenant.status !== "ARCHIVED" && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onSetStatus(tenant.id, tenant.name, "ARCHIVED")}
                            >
                              {t("admin.archive")}
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
              <span>{t("admin.page", { page: data.page, totalPages })}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {t("admin.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("admin.next")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
