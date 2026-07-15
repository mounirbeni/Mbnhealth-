"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Eye, Scan, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientCombobox } from "@/components/patients/patient-combobox";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderDetailSheet } from "@/components/orders/order-detail-sheet";
import { useDoctors } from "@/hooks/use-doctors";
import { useCreateRadiologyOrder, useRadiologyOrders, useUpdateRadiologyOrder } from "@/hooks/use-lab-radiology";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

function NewRadiologyOrderDialog() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { data: doctors } = useDoctors();
  const createOrder = useCreateRadiologyOrder();
  const { register, handleSubmit, control, reset } = useForm<{ patientId: string; doctorId: string; examType: string }>();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> {t("dashboard.radiology.newOrder")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.radiology.newOrderDialogTitle")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createOrder.mutateAsync(v);
              toast.success(t("dashboard.radiology.createdToast"));
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.radiology.createFailedToast"));
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>{t("dashboard.radiology.patientLabel")}</Label>
            <Controller control={control} name="patientId" rules={{ required: true }} render={({ field }) => <PatientCombobox value={field.value} onChange={(id) => field.onChange(id)} />} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.radiology.orderingDoctorLabel")}</Label>
            <Controller
              control={control}
              name="doctorId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard.radiology.selectDoctorPlaceholder")} />
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
            <Label>{t("dashboard.radiology.examTypeLabel")}</Label>
            <Input {...register("examType", { required: true })} placeholder={t("dashboard.radiology.examTypePlaceholder")} />
          </div>
          <DialogFooter>
            <Button type="submit">{t("dashboard.radiology.createOrder")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function RadiologyPage() {
  const { data: orders, isLoading } = useRadiologyOrders();
  const updateOrder = useUpdateRadiologyOrder();
  const { hasPermission } = useAuth();
  const { t } = useLocale();
  const [detailOrder, setDetailOrder] = useState<any | null>(null);

  const counts = useMemo(() => {
    const acc: Record<string, number> = { ORDERED: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    for (const o of orders ?? []) acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, [orders]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title">{t("dashboard.radiology.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.radiology.subtitle")}</p>
        </div>
        {hasPermission("RADIOLOGY_WRITE") && <NewRadiologyOrderDialog />}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(["ORDERED", "IN_PROGRESS", "COMPLETED"] as const).map((status) => (
          <div key={status} className="surface-card p-4">
            <p className="text-2xl font-semibold tracking-tight">{counts[status] ?? 0}</p>
            <p className="text-sm text-muted-foreground">{t(`workflowStatus.${status}`)}</p>
          </div>
        ))}
      </div>

      <div className="surface-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dashboard.radiology.colExam")}</TableHead>
              <TableHead>{t("dashboard.radiology.colPatient")}</TableHead>
              <TableHead>{t("dashboard.radiology.colDoctor")}</TableHead>
              <TableHead>{t("dashboard.radiology.colOrdered")}</TableHead>
              <TableHead>{t("dashboard.radiology.colStatus")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders && orders.length > 0 ? (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    <Scan className="h-4 w-4 text-primary" /> {o.examType}
                  </TableCell>
                  <TableCell>
                    {o.patient.firstName} {o.patient.lastName}
                  </TableCell>
                  <TableCell>
                    {t("patientPortal.clinicProfile.doctorTitle", { name: `${o.doctor.user.firstName} ${o.doctor.user.lastName}` })}
                  </TableCell>
                  <TableCell>{formatDateTime(o.orderedAt)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="space-x-2 whitespace-nowrap">
                    {hasPermission("RADIOLOGY_WRITE") && o.status === "ORDERED" && (
                      <Button size="sm" variant="outline" onClick={() => updateOrder.mutate({ id: o.id, action: "start" })}>
                        {t("dashboard.radiology.start")}
                      </Button>
                    )}
                    {hasPermission("RADIOLOGY_WRITE") && o.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrder.mutate({ id: o.id, action: "complete", data: { findings: "No acute findings" } })}
                      >
                        {t("dashboard.radiology.complete")}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setDetailOrder(o)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {t("dashboard.radiology.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {detailOrder && (
        <OrderDetailSheet
          open={!!detailOrder}
          onOpenChange={(open) => !open && setDetailOrder(null)}
          title={detailOrder.examType}
          status={detailOrder.status}
          notesLabel={t("dashboard.radiology.findings")}
          notes={detailOrder.findings}
          rows={[
            { label: t("dashboard.radiology.colPatient"), value: `${detailOrder.patient.firstName} ${detailOrder.patient.lastName}` },
            {
              label: t("dashboard.radiology.colDoctor"),
              value: t("patientPortal.clinicProfile.doctorTitle", {
                name: `${detailOrder.doctor.user.firstName} ${detailOrder.doctor.user.lastName}`,
              }),
            },
            { label: t("dashboard.radiology.colOrdered"), value: formatDateTime(detailOrder.orderedAt) },
          ]}
        />
      )}
    </div>
  );
}
