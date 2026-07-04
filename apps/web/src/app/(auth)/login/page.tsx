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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

const mfaSchema = z.object({ code: z.string().length(6, "Enter the 6-digit code") });
type MfaForm = z.infer<typeof mfaSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyMfa } = useAuth();
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const mfaForm = useForm<MfaForm>({ resolver: zodResolver(mfaSchema) });

  const onLogin = async (values: LoginForm) => {
    setIsSubmitting(true);
    try {
      const res = await login(values.email, values.password);
      if (res.mfaRequired && res.challengeToken) {
        setChallengeToken(res.challengeToken);
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyMfa = async (values: MfaForm) => {
    if (!challengeToken) return;
    setIsSubmitting(true);
    try {
      await verifyMfa(challengeToken, values.code);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Invalid code");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (challengeToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-factor verification</CardTitle>
          <CardDescription>Enter the 6-digit code from your authenticator app.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={mfaForm.handleSubmit(onVerifyMfa)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input id="code" inputMode="numeric" maxLength={6} placeholder="123456" {...mfaForm.register("code")} />
              {mfaForm.formState.errors.code && (
                <p className="text-xs text-destructive">{mfaForm.formState.errors.code.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Verify
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setChallengeToken(null)}>
              Back to login
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Sign in to your clinic&apos;s MBN Health workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@clinic.com" {...loginForm.register("email")} />
            {loginForm.formState.errors.email && (
              <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" {...loginForm.register("password")} />
            {loginForm.formState.errors.password && (
              <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New clinic?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Start your free trial
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Patient?{" "}
          <Link href="/portal/login" className="font-medium text-primary hover:underline">
            Go to your patient portal
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
