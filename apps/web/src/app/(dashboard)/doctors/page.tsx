"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Search, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useLocale } from "@/lib/i18n/locale-context";

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
  const { t } = useLocale();
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
      toast.success(t("dashboard.doctors.addedToast"));
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("dashboard.doctors.addFailedToast"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> {t("dashboard.doctors.newDoctor")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.doctors.addDoctorTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("dashboard.doctors.firstNameLabel")}</Label>
              <Input {...register("firstName", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dashboard.doctors.lastNameLabel")}</Label>
              <Input {...register("lastName", { required: true })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>{t("dashboard.doctors.emailLabel")}</Label>
              <Input type="email" {...register("email", { required: true })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>{t("dashboard.doctors.tempPasswordLabel")}</Label>
              <Input type="password" {...register("password", { required: true, minLength: 8 })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dashboard.doctors.departmentLabel")}</Label>
              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("dashboard.doctors.selectPlaceholder")} />
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
              <Label>{t("dashboard.doctors.consultationFeeLabel")}</Label>
              <Input type="number" {...register("consultationFee")} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>{t("dashboard.doctors.specializationLabel")}</Label>
              <Input {...register("specialization")} placeholder={t("dashboard.doctors.specializationPlaceholder")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={formState.isSubmitting}>
              {t("dashboard.doctors.addDoctor")}
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
  const { t } = useLocale();
  const [search, setSearch] = useState("");

  const filteredDoctors = useMemo(() => {
    if (!search.trim()) return doctors;
    const q = search.trim().toLowerCase();
    return doctors?.filter(
      (d) =>
        `${d.user.firstName} ${d.user.lastName}`.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.department?.name.toLowerCase().includes(q),
    );
  }, [doctors, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title">{t("dashboard.doctors.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.doctors.countOnStaff", { count: doctors?.length ?? 0 })}
          </p>
        </div>
        {hasPermission("DOCTORS_WRITE") && <NewDoctorDialog />}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search")} className="ps-9" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors?.map((doctor, index) => (
            <Card
              key={doctor.id}
              className="surface-card-hover animate-fade-in-up [animation-fill-mode:backwards]"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CardContent className="flex items-start gap-3 p-5">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{initials(doctor.user.firstName, doctor.user.lastName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {t("patientPortal.clinicProfile.doctorTitle", {
                      name: `${doctor.user.firstName} ${doctor.user.lastName}`,
                    })}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {doctor.specialization ?? t("dashboard.doctors.generalPractice")}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {doctor.department && (
                      <Badge variant="secondary" className="gap-1">
                        <Stethoscope className="h-3 w-3" /> {doctor.department.name}
                      </Badge>
                    )}
                    <Badge variant={doctor.user.isActive ? "success" : "secondary"}>
                      {doctor.user.isActive ? t("common.active") : t("common.inactive")}
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
