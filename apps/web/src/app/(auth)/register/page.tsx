"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthCard } from "@/components/auth/auth-card";
import { api, setTokens } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";

type FormValues = {
  clinicName: string;
  slug: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { refreshMe } = useAuth();
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = z.object({
    clinicName: z.string().min(2, t("auth.validation.clinicNameRequired")),
    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9-]+$/, t("auth.validation.slugFormat")),
    ownerFirstName: z.string().min(1, t("auth.validation.required")),
    ownerLastName: z.string().min(1, t("auth.validation.required")),
    ownerEmail: z.string().email(t("auth.validation.emailInvalid")),
    password: z.string().min(8, t("auth.validation.passwordMinLength")),
  });
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await api.post<{ accessToken: string; refreshToken: string }>(
        "/auth/register-tenant",
        values,
        { skipAuth: true },
      );
      setTokens(res.accessToken, res.refreshToken);
      await refreshMe();
      toast.success(t("auth.register.successToast"));
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("auth.register.failedToast"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <CardHeader>
        <CardTitle>{t("auth.register.title")}</CardTitle>
        <CardDescription>{t("auth.register.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="clinicName">{t("auth.register.clinicNameLabel")}</Label>
              <Input id="clinicName" placeholder="Sunrise Medical Center" {...register("clinicName")} />
              {formState.errors.clinicName && (
                <p className="text-xs text-destructive">{formState.errors.clinicName.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="slug">{t("auth.register.clinicUrlLabel")}</Label>
              <Input id="slug" placeholder="sunrise-medical" {...register("slug")} />
              {formState.errors.slug && <p className="text-xs text-destructive">{formState.errors.slug.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerFirstName">{t("auth.register.firstNameLabel")}</Label>
              <Input id="ownerFirstName" {...register("ownerFirstName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerLastName">{t("auth.register.lastNameLabel")}</Label>
              <Input id="ownerLastName" {...register("ownerLastName")} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="ownerEmail">{t("auth.register.workEmailLabel")}</Label>
              <Input id="ownerEmail" type="email" {...register("ownerEmail")} />
              {formState.errors.ownerEmail && (
                <p className="text-xs text-destructive">{formState.errors.ownerEmail.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="password">{t("auth.register.passwordLabel")}</Label>
              <Input id="password" type="password" {...register("password")} />
              {formState.errors.password && (
                <p className="text-xs text-destructive">{formState.errors.password.message}</p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.register.creating") : t("auth.register.create")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.register.alreadyHaveWorkspace")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("auth.register.signIn")}
          </Link>
        </p>
      </CardContent>
    </AuthCard>
  );
}
