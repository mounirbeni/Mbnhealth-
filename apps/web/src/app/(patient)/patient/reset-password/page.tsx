"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patientApi, ApiError } from "@/lib/patient-api-client";
import { useLocale } from "@/lib/i18n/locale-context";

export default function PatientResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <PatientResetPasswordForm />
    </Suspense>
  );
}

function PatientResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) {
      toast.error(t("patientPortal.resetPassword.tooShortToast"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("patientPortal.resetPassword.mismatchToast"));
      return;
    }
    setIsSubmitting(true);
    try {
      await patientApi.post("/public/patient-auth/reset-password", { token, newPassword: password }, { skipAuth: true });
      setDone(true);
      setTimeout(() => router.push("/patient/login"), 2500);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("patientPortal.resetPassword.failedToast"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        {!token ? (
          <>
            <CardHeader>
              <CardTitle>{t("patientPortal.resetPassword.invalidTitle")}</CardTitle>
              <CardDescription>{t("patientPortal.resetPassword.invalidDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/patient/forgot-password">{t("patientPortal.resetPassword.requestNewLink")}</Link>
              </Button>
            </CardContent>
          </>
        ) : done ? (
          <CardHeader className="items-center text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <CardTitle>{t("patientPortal.resetPassword.updatedTitle")}</CardTitle>
            <CardDescription>{t("patientPortal.resetPassword.redirecting")}</CardDescription>
          </CardHeader>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{t("patientPortal.resetPassword.title")}</CardTitle>
              <CardDescription>{t("patientPortal.resetPassword.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("patientPortal.resetPassword.newPassword")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("patientPortal.resetPassword.confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t("patientPortal.resetPassword.updating") : t("patientPortal.resetPassword.updateButton")}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
