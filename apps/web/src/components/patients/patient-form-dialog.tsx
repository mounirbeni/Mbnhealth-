"use client";

import { useState } from "react";
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

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  dob: z.string().min(1, "Required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  bloodType: z.string().optional(),
  address: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function PatientFormDialog() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const createPatient = useCreatePatient();

  const onSubmit = async (values: FormValues) => {
    try {
      await createPatient.mutateAsync({ ...values, email: values.email || undefined });
      toast.success("Patient registered");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create patient");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New Patient
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register new patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...register("firstName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...register("lastName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob">Date of birth</Label>
              <Input id="dob" type="date" {...register("dob")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bloodType">Blood type</Label>
              <Input id="bloodType" placeholder="O+" {...register("bloodType")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={formState.isSubmitting}>
              Register patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
