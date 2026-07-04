"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAdminTenant,
  useAdminTenantAuditLogs,
  useSetTenantStatus,
  useUpdateTenantDetails,
} from "@/hooks/use-admin-tenants";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { ApiError } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/lib/utils";

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

function ClinicInfoCard({ tenant }: { tenant: any }) {
  const updateTenant = useUpdateTenantDetails();
  const { register, handleSubmit } = useForm({
    values: {
      name: tenant.name ?? "",
      city: tenant.city ?? "",
      address: tenant.address ?? "",
      phone: tenant.phone ?? "",
      email: tenant.email ?? "",
      website: tenant.website ?? "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic info</CardTitle>
        <CardDescription>Contact details and identity</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await updateTenant.mutateAsync({
                id: tenant.id,
                ...v,
                email: v.email || undefined,
                website: v.website || undefined,
              });
              toast.success("Clinic info updated");
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed to update clinic");
            }
          })}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2 space-y-1.5">
            <Label>Clinic name</Label>
            <Input {...register("name")} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input {...register("city")} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Address</Label>
            <Input {...register("address")} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input {...register("email")} />
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input {...register("website")} />
          </div>
          <div className="col-span-2">
            <Button type="submit" disabled={updateTenant.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SubscriptionCard({ tenant }: { tenant: any }) {
  const updateTenant = useUpdateTenantDetails();
  const { register, handleSubmit, control, setValue, watch } = useForm({
    values: {
      plan: tenant.subscription?.plan ?? "STARTER",
      seats: tenant.subscription?.seats ?? 5,
    },
  });
  const plan = watch("plan");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Plan and seat allocation</CardDescription>
        </div>
        <Badge variant="secondary">{tenant.subscription?.status ?? "—"}</Badge>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await updateTenant.mutateAsync({ id: tenant.id, plan: v.plan, seats: Number(v.seats) });
              toast.success("Subscription updated");
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed to update subscription");
            }
          })}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Select value={plan} onValueChange={(v) => setValue("plan", v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Seats</Label>
            <Input type="number" min={1} {...register("seats", { valueAsNumber: true })} />
          </div>
          <div className="col-span-2">
            <Button type="submit" disabled={updateTenant.isPending}>
              Save subscription
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AuditLogCard({ tenantId }: { tenantId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminTenantAuditLogs(tenantId, page);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit log</CardTitle>
        <CardDescription>Security-relevant actions recorded for this clinic</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((log: any) => (
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
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}

export default function AdminTenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: tenant, isLoading } = useAdminTenant(id);
  const setStatus = useSetTenantStatus();

  const changeStatus = async (status: "ACTIVE" | "SUSPENDED" | "ARCHIVED") => {
    try {
      await setStatus.mutateAsync({ id, status });
      toast.success(`Clinic ${status === "ACTIVE" ? "reactivated" : status.toLowerCase()}`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to update clinic status");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!tenant) {
    return <p className="text-sm text-muted-foreground">Clinic not found.</p>;
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => router.push("/admin/tenants")}>
        <ArrowLeft className="h-4 w-4" /> Back to clinics
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{tenant.name}</h1>
            <Badge variant={STATUS_BADGE_VARIANT[tenant.status] ?? "secondary"}>{tenant.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {tenant.slug} · {tenant._count?.users ?? 0} users · {tenant._count?.patients ?? 0} patients · created{" "}
            {formatDate(tenant.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {tenant.status !== "ACTIVE" && (
            <Button size="sm" variant="outline" onClick={() => changeStatus("ACTIVE")}>
              Reactivate
            </Button>
          )}
          {tenant.status !== "SUSPENDED" && (
            <Button size="sm" variant="outline" onClick={() => changeStatus("SUSPENDED")}>
              Suspend
            </Button>
          )}
          {tenant.status !== "ARCHIVED" && (
            <Button size="sm" variant="outline" onClick={() => changeStatus("ARCHIVED")}>
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ClinicInfoCard tenant={tenant} />
        <SubscriptionCard tenant={tenant} />
      </div>

      <AuditLogCard tenantId={id} />
    </div>
  );
}
