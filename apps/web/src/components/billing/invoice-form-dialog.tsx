"use client";

import { useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientCombobox } from "@/components/patients/patient-combobox";
import { useCreateInvoice } from "@/hooks/use-billing";
import { ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

interface FormValues {
  patientId: string;
  items: { description: string; quantity: string; unitPrice: string }[];
  taxAmount: string;
  discountAmount: string;
}

export function InvoiceFormDialog() {
  const [open, setOpen] = useState(false);
  const createInvoice = useCreateInvoice();
  const { register, handleSubmit, control, watch, reset } = useForm<FormValues>({
    defaultValues: {
      items: [{ description: "", quantity: "1", unitPrice: "" }],
      taxAmount: "0",
      discountAmount: "0",
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const items = watch("items");
  const subtotal = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

  const onSubmit = async (values: FormValues) => {
    try {
      await createInvoice.mutateAsync({
        patientId: values.patientId,
        items: values.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
        taxAmount: Number(values.taxAmount) || 0,
        discountAmount: Number(values.discountAmount) || 0,
      });
      toast.success("Invoice created");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create invoice");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Patient</Label>
            <Controller
              control={control}
              name="patientId"
              rules={{ required: true }}
              render={({ field }) => <PatientCombobox value={field.value} onChange={(id) => field.onChange(id)} />}
            />
          </div>

          <div className="space-y-2">
            <Label>Line items</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input placeholder="Description" className="flex-1" {...register(`items.${index}.description`, { required: true })} />
                <Input type="number" placeholder="Qty" className="w-16" {...register(`items.${index}.quantity`, { required: true })} />
                <Input type="number" placeholder="Price" className="w-24" {...register(`items.${index}.unitPrice`, { required: true })} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: "", quantity: "1", unitPrice: "" })}
            >
              <Plus className="h-3 w-3" /> Add line item
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tax amount</Label>
              <Input type="number" {...register("taxAmount")} />
            </div>
            <div className="space-y-1.5">
              <Label>Discount amount</Label>
              <Input type="number" {...register("discountAmount")} />
            </div>
          </div>

          <p className="text-right text-sm font-medium">Subtotal: {formatCurrency(subtotal)}</p>

          <DialogFooter>
            <Button type="submit">Create invoice</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
