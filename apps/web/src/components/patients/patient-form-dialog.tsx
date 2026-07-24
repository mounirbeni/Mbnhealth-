"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreatePatient } from "@/hooks/use-patients";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

function buildSchema(required: string, invalidEmail: string) {
  return z.object({
    firstName: z.string().min(1, required),
    lastName: z.string().min(1, required),
    dob: z.string().min(1, required),
    phone: z.string().optional(),
    email: z.string().email(invalidEmail).optional().or(z.literal("")),
    bloodType: z.string().optional(),
    address: z.string().optional(),
  });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export function PatientFormDialog() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const schema = useMemo(
    () => buildSchema(t("dashboard.patients.form.requiredError"), t("dashboard.patients.form.invalidEmailError")),
    [t],
  );
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const createPatient = useCreatePatient();

  const onSubmit = async (values: FormValues) => {
    try {
      await createPatient.mutateAsync({ ...values, email: values.email || undefined });
      toast.success(t("dashboard.patients.form.createdToast"));
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("dashboard.patients.form.createFailedToast"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> {t("dashboard.patients.form.trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.patients.form.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">{t("dashboard.patients.form.firstNameLabel")}</Label>
              <Input id="firstName" {...register("firstName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">{t("dashboard.patients.form.lastNameLabel")}</Label>
              <Input id="lastName" {...register("lastName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob">{t("dashboard.patients.form.dobLabel")}</Label>
              <Input id="dob" type="date" {...register("dob")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bloodType">{t("dashboard.patients.form.bloodTypeLabel")}</Label>
              <Input id="bloodType" placeholder="O+" {...register("bloodType")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("dashboard.patients.form.phoneLabel")}</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("dashboard.patients.form.emailLabel")}</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="address">{t("dashboard.patients.form.addressLabel")}</Label>
              <Input id="address" {...register("address")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={formState.isSubmitting}>
              {t("dashboard.patients.form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
