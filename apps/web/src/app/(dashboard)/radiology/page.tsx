"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Scan, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientCombobox } from "@/components/patients/patient-combobox";
import { useDoctors } from "@/hooks/use-doctors";
import { useCreateRadiologyOrder, useRadiologyOrders, useUpdateRadiologyOrder } from "@/hooks/use-lab-radiology";
import { useAuth } from "@/lib/auth-context";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";

function NewRadiologyOrderDialog() {
  const [open, setOpen] = useState(false);
  const { data: doctors } = useDoctors();
  const createOrder = useCreateRadiologyOrder();
  const { register, handleSubmit, control, reset } = useForm<{ patientId: string; doctorId: string; examType: string }>();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New Radiology Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New radiology order</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createOrder.mutateAsync(v);
              toast.success("Radiology order created");
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed");
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Patient</Label>
            <Controller control={control} name="patientId" rules={{ required: true }} render={({ field }) => <PatientCombobox value={field.value} onChange={(id) => field.onChange(id)} />} />
          </div>
          <div className="space-y-1.5">
            <Label>Ordering doctor</Label>
            <Controller
              control={control}
              name="doctorId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        Dr. {d.user.firstName} {d.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Exam type</Label>
            <Input {...register("examType", { required: true })} placeholder="Chest X-Ray" />
          </div>
          <DialogFooter>
            <Button type="submit">Create order</Button>
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Radiology</h1>
          <p className="text-sm text-muted-foreground">Track imaging orders and findings</p>
        </div>
        {hasPermission("RADIOLOGY_WRITE") && <NewRadiologyOrderDialog />}
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Ordered</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
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
                    Dr. {o.doctor.user.firstName} {o.doctor.user.lastName}
                  </TableCell>
                  <TableCell>{formatDateTime(o.orderedAt)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[o.status] ?? "secondary"}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    {hasPermission("RADIOLOGY_WRITE") && o.status === "ORDERED" && (
                      <Button size="sm" variant="outline" onClick={() => updateOrder.mutate({ id: o.id, action: "start" })}>
                        Start
                      </Button>
                    )}
                    {hasPermission("RADIOLOGY_WRITE") && o.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrder.mutate({ id: o.id, action: "complete", data: { findings: "No acute findings" } })}
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No radiology orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
