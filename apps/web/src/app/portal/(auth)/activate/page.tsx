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

const schema = z
  .object({
    mrn: z.string().min(1, "Enter your patient file number"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });
type ActivateForm = z.infer<typeof schema>;

export default function PortalActivatePage() {
  const router = useRouter();
  const { activate } = usePortalAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<ActivateForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: ActivateForm) => {
    setIsSubmitting(true);
    try {
      await activate(values.mrn, values.email, values.password);
      toast.success("Account activated!");
      router.push("/portal");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Activation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activate your account</CardTitle>
        <CardDescription>
          Enter your patient file number (MRN) and the email on file at your clinic to set up portal access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mrn">Patient file number (MRN)</Label>
            <Input id="mrn" placeholder="MRN-000123" {...register("mrn")} />
            {formState.errors.mrn && <p className="text-xs text-destructive">{formState.errors.mrn.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email on file</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {formState.errors.email && <p className="text-xs text-destructive">{formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Choose a password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {formState.errors.password && (
              <p className="text-xs text-destructive">{formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
            {formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">{formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Activating..." : "Activate account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already activated?{" "}
          <Link href="/portal/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
