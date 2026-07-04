"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
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

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, verifyMfa, logout } = useAuth();
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
      } else if (res.user && res.user.tenantId) {
        toast.error("This is a clinic account. Please sign in from the Clinic portal.");
        await logout("/login");
      } else {
        toast.success("Welcome back!");
        router.push("/admin/tenants");
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
      const res = await verifyMfa(challengeToken, values.code);
      if (res.user && res.user.tenantId) {
        toast.error("This is a clinic account. Please sign in from the Clinic portal.");
        await logout("/login");
        return;
      }
      toast.success("Welcome back!");
      router.push("/admin/tenants");
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
        <div className="mb-1 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle>Admin sign in</CardTitle>
        </div>
        <CardDescription>Platform administration — clinic accounts should sign in separately.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@mbnhealth.com" {...loginForm.register("email")} />
            {loginForm.formState.errors.email && (
              <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...loginForm.register("password")} />
            {loginForm.formState.errors.password && (
              <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
