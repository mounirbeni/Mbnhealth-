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
import { usePortalAuth } from "@/lib/portal-auth-context";
import { ApiError } from "@/lib/api-client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof schema>;

export default function PortalLoginPage() {
  const router = useRouter();
  const { login } = usePortalAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      toast.success("Welcome back!");
      router.push("/portal");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your appointments, records, and bills.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {formState.errors.email && <p className="text-xs text-destructive">{formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/portal/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {formState.errors.password && (
              <p className="text-xs text-destructive">{formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          First time here?{" "}
          <Link href="/portal/activate" className="font-medium text-primary hover:underline">
            Activate your account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
