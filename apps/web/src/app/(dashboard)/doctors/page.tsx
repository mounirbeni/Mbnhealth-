"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDoctors } from "@/hooks/use-doctors";
import { useDepartments } from "@/hooks/use-departments";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { initials } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface DoctorFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  departmentId?: string;
  specialization?: string;
  consultationFee?: string;
}

function NewDoctorDialog() {
  const [open, setOpen] = useState(false);
  const { data: departments } = useDepartments();
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, reset, formState } = useForm<DoctorFormValues>();

  const onSubmit = async (values: DoctorFormValues) => {
    try {
      await api.post("/doctors", {
        ...values,
        consultationFee: values.consultationFee ? Number(values.consultationFee) : undefined,
      });
      toast.success("Doctor added");
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add doctor");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New Doctor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add doctor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input {...register("firstName", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input {...register("lastName", { required: true })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register("email", { required: true })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Temporary password</Label>
              <Input type="password" {...register("password", { required: true, minLength: 8 })} />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Consultation fee</Label>
              <Input type="number" {...register("consultationFee")} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Specialization</Label>
              <Input {...register("specialization")} placeholder="Cardiology" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={formState.isSubmitting}>
              Add doctor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DoctorsPage() {
  const { data: doctors, isLoading } = useDoctors();
  const { hasPermission } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Doctors</h1>
          <p className="text-sm text-muted-foreground">{doctors?.length ?? 0} doctors on staff</p>
        </div>
        {hasPermission("DOCTORS_WRITE") && <NewDoctorDialog />}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors?.map((doctor) => (
            <Card key={doctor.id}>
              <CardContent className="flex items-start gap-3 p-5">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{initials(doctor.user.firstName, doctor.user.lastName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    Dr. {doctor.user.firstName} {doctor.user.lastName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{doctor.specialization ?? "General Practice"}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {doctor.department && (
                      <Badge variant="secondary" className="gap-1">
                        <Stethoscope className="h-3 w-3" /> {doctor.department.name}
                      </Badge>
                    )}
                    <Badge variant={doctor.user.isActive ? "success" : "secondary"}>
                      {doctor.user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
