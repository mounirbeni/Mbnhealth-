"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAdminTenants, useCreateTenant, useSetTenantStatus, type CreateTenantInput } from "@/hooks/use-admin-tenants";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

function NewClinicDialog() {
  const [open, setOpen] = useState(false);
  const createTenant = useCreateTenant();
  const { register, handleSubmit, control, reset } = useForm<CreateTenantInput>({
    defaultValues: { plan: "STARTER" },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New Clinic
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a clinic</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createTenant.mutateAsync(v);
              toast.success("Clinic created");
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed to create clinic");
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Clinic name</Label>
            <Input {...register("name", { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input {...register("city")} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...register("phone")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input {...register("address")} />
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Controller
              control={control}
              name="plan"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STARTER">Starter</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Owner first name</Label>
              <Input {...register("ownerFirstName", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Owner last name</Label>
              <Input {...register("ownerLastName", { required: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Owner email</Label>
            <Input type="email" {...register("ownerEmail", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Temporary password</Label>
            <Input type="password" {...register("password", { required: true, minLength: 8 })} />
          </div>
          <DialogFooter>
            <Button type="submit">Create clinic</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Clinics</h1>
          <p className="text-sm text-muted-foreground">Every clinic registered on the platform</p>
        </div>
        <NewClinicDialog />
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
                    <Link href={`/admin/tenants/${t.id}`} className="flex items-center gap-2 hover:underline">
                      <Building2 className="h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <div>{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.slug}</div>
                      </div>
                    </Link>
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
