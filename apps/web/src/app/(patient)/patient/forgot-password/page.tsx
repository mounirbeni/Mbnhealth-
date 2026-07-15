"use client";

import { useState } from "react";
import Link from "next/link";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patientApi } from "@/lib/patient-api-client";
import { useLocale } from "@/lib/i18n/locale-context";

export default function PatientForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await patientApi.post("/public/patient-auth/forgot-password", { email }, { skipAuth: true });
    } finally {
      setIsSubmitting(false);
      setSent(true);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <AuthCard>
        {sent ? (
          <>
            <CardHeader>
              <CardTitle>{t("patientPortal.forgotPassword.checkEmailTitle")}</CardTitle>
              <CardDescription>{t("patientPortal.forgotPassword.checkEmailDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/patient/login">{t("patientPortal.forgotPassword.backToSignIn")}</Link>
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{t("patientPortal.forgotPassword.title")}</CardTitle>
              <CardDescription>{t("patientPortal.forgotPassword.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("common.email")}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t("patientPortal.forgotPassword.sending") : t("patientPortal.forgotPassword.sendButton")}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/patient/login" className="font-medium text-primary hover:underline">
                  {t("patientPortal.forgotPassword.backToSignIn")}
                </Link>
              </p>
            </CardContent>
          </>
        )}
      </AuthCard>
    </div>
  );
}
