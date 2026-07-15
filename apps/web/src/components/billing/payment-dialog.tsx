"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRecordPayment } from "@/hooks/use-billing";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

const METHODS = ["CASH", "CARD", "INSURANCE", "BANK_TRANSFER", "MOBILE_MONEY"];

export function PaymentDialog({ invoiceId, balanceDue }: { invoiceId: string; balanceDue: number }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const recordPayment = useRecordPayment();
  const { register, handleSubmit, control, reset } = useForm<{ amount: string; method: string; transactionRef?: string }>({
    defaultValues: { amount: String(balanceDue), method: "CASH" },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <CreditCard className="h-3.5 w-3.5" /> {t("dashboard.billing.paymentDialog.recordPayment")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.billing.paymentDialog.recordPayment")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await recordPayment.mutateAsync({
                invoiceId,
                data: { amount: Number(v.amount), method: v.method, transactionRef: v.transactionRef },
              });
              toast.success(t("dashboard.billing.paymentDialog.paymentRecorded"));
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.billing.paymentDialog.paymentRecordFailed"));
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>{t("dashboard.billing.paymentDialog.amount")}</Label>
            <Input type="number" step="0.01" {...register("amount", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.billing.paymentDialog.method")}</Label>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {t(`paymentMethod.${m}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              {t("dashboard.billing.paymentDialog.transactionReference", { optional: t("common.optional") })}
            </Label>
            <Input {...register("transactionRef")} />
          </div>
          <DialogFooter>
            <Button type="submit">{t("dashboard.billing.paymentDialog.recordPayment")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
