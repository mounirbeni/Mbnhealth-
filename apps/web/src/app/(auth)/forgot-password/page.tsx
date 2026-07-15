"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthCard } from "@/components/auth/auth-card";
import { api } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

type FormValues = { email: string; tenantSlug?: string };

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = z.object({
    email: z.string().email(t("auth.validation.emailInvalid")),
    tenantSlug: z.string().optional(),
  });
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", tenantSlug: "" } });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await api.post(
        "/auth/forgot-password",
        { email: values.email, tenantSlug: values.tenantSlug || undefined },
        { skipAuth: true },
      );
    } finally {
      setIsSubmitting(false);
      // Always show the same confirmation, whether or not the account exists.
      setSent(true);
    }
  };

  if (sent) {
    return (
      <AuthCard>
        <CardHeader>
          <CardTitle>{t("auth.forgotPassword.checkEmailTitle")}</CardTitle>
          <CardDescription>{t("auth.forgotPassword.checkEmailDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">{t("auth.forgotPassword.backToSignIn")}</Link>
          </Button>
        </CardContent>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <CardHeader>
        <CardTitle>{t("auth.forgotPassword.title")}</CardTitle>
        <CardDescription>{t("auth.forgotPassword.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">{t("auth.forgotPassword.tenantSlugLabel")}</Label>
            <Input id="tenantSlug" placeholder="demo-clinic" {...form.register("tenantSlug")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.forgotPassword.emailLabel")}</Label>
            <Input id="email" type="email" placeholder="you@clinic.com" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.forgotPassword.sending") : t("auth.forgotPassword.sendButton")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("auth.forgotPassword.backToSignIn")}
          </Link>
        </p>
      </CardContent>
    </AuthCard>
  );
}
