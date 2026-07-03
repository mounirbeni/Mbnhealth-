"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, setTokens } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const OWNER_ROLES = [
  { value: "CLINIC_OWNER", label: "Clinic Owner" },
  { value: "MANAGER", label: "Manager" },
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "ASSISTANT", label: "Assistant" },
  { value: "LABORATORY", label: "Laboratory" },
  { value: "RADIOLOGY", label: "Radiology" },
  { value: "ACCOUNTANT", label: "Accountant" },
] as const;

const schema = z.object({
  clinicName: z.string().min(2, "Clinic name is required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, "Enter a valid mobile phone number"),
  ownerFirstName: z.string().min(1, "Required"),
  ownerLastName: z.string().min(1, "Required"),
  ownerRole: z.enum(OWNER_ROLES.map((r) => r.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Select your role" }),
  }),
  ownerEmail: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { refreshMe } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

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
      toast.success("Your clinic workspace is ready!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start your free trial</CardTitle>
        <CardDescription>Set up your clinic&apos;s MBN Health workspace in under a minute.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="clinicName">Clinic name</Label>
              <Input id="clinicName" placeholder="Sunrise Medical Center" {...register("clinicName")} />
              {formState.errors.clinicName && (
                <p className="text-xs text-destructive">{formState.errors.clinicName.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="slug">Clinic URL (a short ID for your workspace, not a real website)</Label>
              <Input id="slug" placeholder="sunrise-medical" {...register("slug")} />
              {formState.errors.slug && <p className="text-xs text-destructive">{formState.errors.slug.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Casablanca" {...register("city")} />
              {formState.errors.city && <p className="text-xs text-destructive">{formState.errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="12 Avenue Mohammed V" {...register("address")} />
              {formState.errors.address && (
                <p className="text-xs text-destructive">{formState.errors.address.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerFirstName">First name</Label>
              <Input id="ownerFirstName" {...register("ownerFirstName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerLastName">Last name</Label>
              <Input id="ownerLastName" {...register("ownerLastName")} />
            </div>
            <div className="space-y-2">
              <Label>Your role</Label>
              <Controller
                control={control}
                name="ownerRole"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {OWNER_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {formState.errors.ownerRole && (
                <p className="text-xs text-destructive">{formState.errors.ownerRole.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile phone</Label>
              <Input id="phone" type="tel" placeholder="+212612345678" {...register("phone")} />
              {formState.errors.phone && (
                <p className="text-xs text-destructive">{formState.errors.phone.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="ownerEmail">Work email</Label>
              <Input id="ownerEmail" type="email" {...register("ownerEmail")} />
              {formState.errors.ownerEmail && (
                <p className="text-xs text-destructive">{formState.errors.ownerEmail.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {formState.errors.password && (
                <p className="text-xs text-destructive">{formState.errors.password.message}</p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating workspace..." : "Create workspace"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have a workspace?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
