"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { useTenant, useUpdateTenant } from "@/hooks/use-tenant";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";

function ProfileTab() {
  const { user } = useAuth();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your profile</CardTitle>
        <CardDescription>Your personal account details.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>First name</Label>
          <Input value={user?.firstName ?? ""} disabled />
        </div>
        <div className="space-y-1.5">
          <Label>Last name</Label>
          <Input value={user?.lastName ?? ""} disabled />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Input value={user?.roleName ?? ""} disabled />
        </div>
      </CardContent>
    </Card>
  );
}

function ClinicTab() {
  const { data: tenant } = useTenant();
  const updateTenant = useUpdateTenant();
  const { hasPermission } = useAuth();
  const { register, handleSubmit, formState } = useForm({
    values: tenant
      ? { name: tenant.name, address: tenant.address ?? "", phone: tenant.phone ?? "", email: tenant.email ?? "" }
      : undefined,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic settings</CardTitle>
        <CardDescription>
          Plan: <Badge variant="secondary">{tenant?.subscription?.plan ?? "—"}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await updateTenant.mutateAsync(v);
              toast.success("Clinic settings updated");
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed to update");
            }
          })}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2 space-y-1.5">
            <Label>Clinic name</Label>
            <Input {...register("name")} disabled={!hasPermission("SETTINGS_MANAGE")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Address</Label>
            <Input {...register("address")} disabled={!hasPermission("SETTINGS_MANAGE")} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input {...register("phone")} disabled={!hasPermission("SETTINGS_MANAGE")} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input {...register("email")} disabled={!hasPermission("SETTINGS_MANAGE")} />
          </div>
          {hasPermission("SETTINGS_MANAGE") && (
            <div className="col-span-2">
              <Button type="submit" disabled={formState.isSubmitting}>
                Save changes
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function SecurityTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [setupData, setSetupData] = useState<{ qrCodeDataUrl: string; secret: string } | null>(null);
  const [code, setCode] = useState("");

  const { data: sessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.get<any[]>("/auth/sessions"),
  });

  const startMfaSetup = async () => {
    try {
      const data = await api.post<{ qrCodeDataUrl: string; secret: string }>("/auth/mfa/setup");
      setSetupData(data);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to start MFA setup");
    }
  };

  const confirmMfa = async () => {
    try {
      await api.post("/auth/mfa/confirm", { code });
      toast.success("Two-factor authentication enabled");
      setSetupData(null);
      setCode("");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Invalid code");
    }
  };

  const disableMfa = async () => {
    try {
      await api.post("/auth/mfa/disable");
      toast.success("Two-factor authentication disabled");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  };

  const revokeSession = async (id: string) => {
    await api.delete(`/auth/sessions/${id}`);
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Two-factor authentication</CardTitle>
            <CardDescription>Add an extra layer of security using an authenticator app.</CardDescription>
          </div>
          <Switch checked={!!user} disabled />
        </CardHeader>
        <CardContent>
          {setupData ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setupData.qrCodeDataUrl} alt="MFA QR code" className="h-40 w-40 rounded-lg border border-border" />
              <p className="text-xs text-muted-foreground">Or enter this code manually: {setupData.secret}</p>
              <div className="flex gap-2">
                <Input placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
                <Button onClick={confirmMfa}>Confirm</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={startMfaSetup}>
                <ShieldCheck className="h-4 w-4" /> Enable 2FA
              </Button>
              <Button variant="outline" onClick={disableMfa}>
                Disable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {sessions && sessions.length > 0 ? (
            sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{s.userAgent ?? "Unknown device"}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.ipAddress} · Last active {formatDateTime(s.lastActiveAt)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => revokeSession(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">No active sessions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, clinic, and security preferences.</p>
      </div>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="clinic">Clinic</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="clinic">
          <ClinicTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
