"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { FlaskConical, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientCombobox } from "@/components/patients/patient-combobox";
import { useDoctors } from "@/hooks/use-doctors";
import { useCreateLabOrder, useLabOrders, useUpdateLabOrder } from "@/hooks/use-lab-radiology";
import { useAuth } from "@/lib/auth-context";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

function NewLabOrderDialog() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { data: doctors } = useDoctors();
  const createOrder = useCreateLabOrder();
  const { register, handleSubmit, control, reset } = useForm<{ patientId: string; doctorId: string; testName: string }>();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> {t("dashboard.lab.newOrder")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.lab.newOrderDialogTitle")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createOrder.mutateAsync(v);
              toast.success(t("dashboard.lab.createdToast"));
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.lab.createFailedToast"));
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>{t("dashboard.lab.patientLabel")}</Label>
            <Controller control={control} name="patientId" rules={{ required: true }} render={({ field }) => <PatientCombobox value={field.value} onChange={(id) => field.onChange(id)} />} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.lab.orderingDoctorLabel")}</Label>
            <Controller
              control={control}
              name="doctorId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard.lab.selectDoctorPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {t("patientPortal.clinicProfile.doctorTitle", { name: `${d.user.firstName} ${d.user.lastName}` })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.lab.testNameLabel")}</Label>
            <Input {...register("testName", { required: true })} placeholder={t("dashboard.lab.testNamePlaceholder")} />
          </div>
          <DialogFooter>
            <Button type="submit">{t("dashboard.lab.createOrder")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function LabPage() {
  const { data: orders, isLoading } = useLabOrders();
  const updateOrder = useUpdateLabOrder();
  const { hasPermission } = useAuth();
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t("dashboard.lab.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.lab.subtitle")}</p>
        </div>
        {hasPermission("LAB_WRITE") && <NewLabOrderDialog />}
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dashboard.lab.colTest")}</TableHead>
              <TableHead>{t("dashboard.lab.colPatient")}</TableHead>
              <TableHead>{t("dashboard.lab.colDoctor")}</TableHead>
              <TableHead>{t("dashboard.lab.colOrdered")}</TableHead>
              <TableHead>{t("dashboard.lab.colStatus")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {t("dashboard.lab.loading")}
                </TableCell>
              </TableRow>
            ) : orders && orders.length > 0 ? (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    <FlaskConical className="h-4 w-4 text-primary" /> {o.testName}
                  </TableCell>
                  <TableCell>
                    {o.patient.firstName} {o.patient.lastName}
                  </TableCell>
                  <TableCell>
                    {t("patientPortal.clinicProfile.doctorTitle", { name: `${o.doctor.user.firstName} ${o.doctor.user.lastName}` })}
                  </TableCell>
                  <TableCell>{formatDateTime(o.orderedAt)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[o.status] ?? "secondary"}>{t(`workflowStatus.${o.status}`)}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    {hasPermission("LAB_WRITE") && o.status === "ORDERED" && (
                      <Button size="sm" variant="outline" onClick={() => updateOrder.mutate({ id: o.id, action: "start" })}>
                        {t("dashboard.lab.start")}
                      </Button>
                    )}
                    {hasPermission("LAB_WRITE") && o.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrder.mutate({ id: o.id, action: "complete", data: { resultNotes: "Results within normal range" } })}
                      >
                        {t("dashboard.lab.complete")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {t("dashboard.lab.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
