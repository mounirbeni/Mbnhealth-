"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Plus, UserX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateStaff, useDeactivateStaff, useRoles, useStaff } from "@/hooks/use-users";
import { ApiError } from "@/lib/api-client";
import { initials } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

function NewStaffDialog() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { data: roles } = useRoles();
  const createStaff = useCreateStaff();
  const { register, handleSubmit, control, reset } = useForm<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleId: string;
  }>();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> {t("dashboard.staff.newStaffMember")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.staff.inviteStaffTitle")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createStaff.mutateAsync(v);
              toast.success(t("dashboard.staff.addedToast"));
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.staff.addFailedToast"));
            }
          })}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("dashboard.staff.firstNameLabel")}</Label>
              <Input {...register("firstName", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dashboard.staff.lastNameLabel")}</Label>
              <Input {...register("lastName", { required: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.staff.emailLabel")}</Label>
            <Input type="email" {...register("email", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.staff.tempPasswordLabel")}</Label>
            <Input type="password" {...register("password", { required: true, minLength: 8 })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.staff.roleLabel")}</Label>
            <Controller
              control={control}
              name="roleId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard.staff.selectRolePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit">{t("dashboard.staff.addStaffMember")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const { data: staff, isLoading } = useStaff(search);
  const deactivate = useDeactivateStaff();
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t("dashboard.staff.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.staff.subtitle")}</p>
        </div>
        <NewStaffDialog />
      </div>

      <Input
        placeholder={t("dashboard.staff.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dashboard.staff.colName")}</TableHead>
              <TableHead>{t("dashboard.staff.colRole")}</TableHead>
              <TableHead>{t("dashboard.staff.colEmail")}</TableHead>
              <TableHead>{t("dashboard.staff.colStatus")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {t("dashboard.staff.loading")}
                </TableCell>
              </TableRow>
            ) : staff && staff.length > 0 ? (
              staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>{initials(s.firstName, s.lastName)}</AvatarFallback>
                    </Avatar>
                    {s.firstName} {s.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{s.role?.name}</Badge>
                  </TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ? "success" : "secondary"}>
                      {s.isActive ? t("common.active") : t("common.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.isActive && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deactivate.mutate(s.id)}
                        title={t("dashboard.staff.deactivateTitle")}
                      >
                        <UserX className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {t("dashboard.staff.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
