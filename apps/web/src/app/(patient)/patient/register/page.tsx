"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePatientAuth } from "@/lib/patient-auth-context";
import { ApiError } from "@/lib/patient-api-client";
import { useLocale } from "@/lib/i18n/locale-context";

export default function PatientRegisterPage() {
  return (
    <Suspense fallback={null}>
      <PatientRegisterForm />
    </Suspense>
  );
}

function PatientRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/find-a-clinic";
  const { register } = usePatientAuth();
  const { t } = useLocale();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(form);
      router.push(next);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("patientPortal.register.registrationFailedToast"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <AuthCard>
        <CardHeader>
          <CardTitle>{t("patientPortal.register.title")}</CardTitle>
          <CardDescription>{t("patientPortal.register.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("patientPortal.register.firstName")}</Label>
                <Input id="firstName" value={form.firstName} onChange={update("firstName")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("patientPortal.register.lastName")}</Label>
                <Input id="lastName" value={form.lastName} onChange={update("lastName")} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input id="email" type="email" value={form.email} onChange={update("email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("patientPortal.register.phoneOptional")}</Label>
              <Input id="phone" value={form.phone} onChange={update("phone")} placeholder="+212 6..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("common.password")}</Label>
              <Input id="password" type="password" minLength={8} value={form.password} onChange={update("password")} required />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("patientPortal.register.creating") : t("patientPortal.register.create")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("patientPortal.register.alreadyHaveAccount")}{" "}
            <Link href={`/patient/login?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
              {t("common.signIn")}
            </Link>
          </p>
        </CardContent>
      </AuthCard>
    </div>
  );
}
