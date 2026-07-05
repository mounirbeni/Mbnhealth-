"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

const DEMO_ACCOUNTS = [
  { roleKey: "demoRoleOwner", email: "owner@demo-clinic.com" },
  { roleKey: "demoRoleManager", email: "manager@demo-clinic.com" },
  { roleKey: "demoRoleReceptionist", email: "reception@demo-clinic.com" },
  { roleKey: "demoRoleDoctor", email: "dr.hicham@demo-clinic.com" },
] as const;
const DEMO_PASSWORD = "Passw0rd!123";

function useLoginSchemas() {
  const { t } = useLocale();
  const loginSchema = z.object({
    email: z.string().email(t("auth.validation.emailInvalid")),
    password: z.string().min(1, t("auth.validation.passwordRequired")),
    tenantSlug: z.string().optional(),
  });
  const mfaSchema = z.object({ code: z.string().length(6, t("auth.validation.codeLength")) });
  return { loginSchema, mfaSchema };
}
type LoginForm = { email: string; password: string; tenantSlug?: string };
type MfaForm = { code: string };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicParam = searchParams.get("clinic") ?? undefined;
  const { login, verifyMfa } = useAuth();
  const { t } = useLocale();
  const { loginSchema, mfaSchema } = useLoginSchemas();
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenantSlug: clinicParam ?? "", email: "", password: "" },
  });
  const mfaForm = useForm<MfaForm>({ resolver: zodResolver(mfaSchema) });

  const fillDemoAccount = (email: string) => {
    loginForm.setValue("tenantSlug", "demo-clinic");
    loginForm.setValue("email", email);
    loginForm.setValue("password", DEMO_PASSWORD);
  };

  const onLogin = async (values: LoginForm) => {
    setIsSubmitting(true);
    try {
      const res = await login(values.email, values.password, values.tenantSlug || undefined);
      if (res.mfaRequired && res.challengeToken) {
        setChallengeToken(res.challengeToken);
      } else {
        toast.success(t("auth.login.welcomeBackToast"));
        router.push(res.user?.systemRole === "SUPER_ADMIN" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("auth.login.loginFailedToast"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyMfa = async (values: MfaForm) => {
    if (!challengeToken) return;
    setIsSubmitting(true);
    try {
      const res = await verifyMfa(challengeToken, values.code);
      toast.success(t("auth.login.welcomeBackToast"));
      router.push(res.user?.systemRole === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("auth.login.invalidCodeToast"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (challengeToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.mfa.title")}</CardTitle>
          <CardDescription>{t("auth.mfa.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={mfaForm.handleSubmit(onVerifyMfa)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">{t("auth.mfa.codeLabel")}</Label>
              <Input id="code" inputMode="numeric" maxLength={6} placeholder="123456" {...mfaForm.register("code")} />
              {mfaForm.formState.errors.code && (
                <p className="text-xs text-destructive">{mfaForm.formState.errors.code.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {t("auth.mfa.verify")}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setChallengeToken(null)}>
              {t("auth.mfa.backToLogin")}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.login.title")}</CardTitle>
        <CardDescription>{t("auth.login.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        {clinicParam === "demo-clinic" && (
          <div className="mb-4 space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-medium text-foreground">{t("auth.login.demoBanner")}</p>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemoAccount(acc.email)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:bg-accent"
                >
                  {t(`auth.login.${acc.roleKey}`)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("auth.login.demoPasswordLabel", { password: DEMO_PASSWORD })}
            </p>
          </div>
        )}
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">{t("auth.login.tenantSlugLabel")}</Label>
            <Input id="tenantSlug" placeholder="demo-clinic" {...loginForm.register("tenantSlug")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.login.emailLabel")}</Label>
            <Input id="email" type="email" placeholder="you@clinic.com" {...loginForm.register("email")} />
            {loginForm.formState.errors.email && (
              <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("auth.login.passwordLabel")}</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                {t("auth.login.forgotPassword")}
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" {...loginForm.register("password")} />
            {loginForm.formState.errors.password && (
              <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.login.signingIn") : t("auth.login.signIn")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.login.newClinic")}{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t("auth.login.startTrial")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
