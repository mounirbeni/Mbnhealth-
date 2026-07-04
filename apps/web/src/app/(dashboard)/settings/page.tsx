"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, CreditCard, ExternalLink, MessageCircle, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { useTenant, useUpdateTenant } from "@/hooks/use-tenant";
import { useUpsertWhatsAppConfig, useWhatsAppConfig } from "@/hooks/use-whatsapp";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import { PRICING_PLANS, formatPlanPrice } from "@/lib/pricing";

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
      ? {
          name: tenant.name,
          address: tenant.address ?? "",
          city: tenant.city ?? "",
          phone: tenant.phone ?? "",
          email: tenant.email ?? "",
        }
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
            <Label>City</Label>
            <Input
              {...register("city")}
              placeholder="e.g. Casablanca"
              disabled={!hasPermission("SETTINGS_MANAGE")}
            />
            <p className="text-xs text-muted-foreground">Used so patients can filter by city in the public directory.</p>
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

function WhatsAppTab() {
  const { data: config } = useWhatsAppConfig();
  const upsertConfig = useUpsertWhatsAppConfig();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("SETTINGS_MANAGE");
  const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/whatsapp/webhook`;

  const { register, handleSubmit, formState, watch, setValue } = useForm({
    values: config
      ? {
          phoneNumberId: config.phoneNumberId,
          businessAccountId: config.businessAccountId ?? "",
          displayPhoneNumber: config.displayPhoneNumber ?? "",
          accessToken: "",
          isActive: config.isActive,
          aiBotEnabled: config.aiBotEnabled,
        }
      : undefined,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business Cloud API</CardTitle>
          <CardDescription>
            Connect a real WhatsApp Business phone number from{" "}
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-primary hover:underline"
            >
              Meta for Developers <ExternalLink className="h-3 w-3" />
            </a>{" "}
            to send real reminders and let patients chat with your AI assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 text-xs">
            <p className="font-medium">Webhook URL to paste into your Meta App&apos;s WhatsApp configuration:</p>
            <code className="mt-1 block break-all rounded bg-background px-2 py-1">{webhookUrl}</code>
          </div>
          <form
            onSubmit={handleSubmit(async (v) => {
              try {
                const payload = { ...v, accessToken: v.accessToken || undefined };
                if (!payload.accessToken) delete (payload as any).accessToken;
                await upsertConfig.mutateAsync(payload);
                toast.success("WhatsApp configuration saved");
              } catch (e) {
                toast.error(e instanceof ApiError ? e.message : "Failed to save");
              }
            })}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumberId">Phone number ID</Label>
              <Input id="phoneNumberId" {...register("phoneNumberId", { required: true })} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayPhoneNumber">Display phone number</Label>
              <Input
                id="displayPhoneNumber"
                {...register("displayPhoneNumber")}
                placeholder="+212 522 000 000"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessAccountId">Business account ID (optional)</Label>
              <Input id="businessAccountId" {...register("businessAccountId")} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accessToken">Access token {config && "(leave blank to keep current)"}</Label>
              <Input
                id="accessToken"
                type="password"
                {...register("accessToken", { required: !config })}
                disabled={!canManage}
              />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Connection active</p>
                <p className="text-xs text-muted-foreground">Turn off to pause all outbound WhatsApp sends for this clinic.</p>
              </div>
              <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} disabled={!canManage} />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">AI assistant replies</p>
                <p className="text-xs text-muted-foreground">
                  When on, incoming messages get an automatic limited-capability AI reply (clinic FAQ + the
                  patient&apos;s own upcoming appointments). When off, messages are just logged for staff to answer.
                </p>
              </div>
              <Switch checked={watch("aiBotEnabled")} onCheckedChange={(v) => setValue("aiBotEnabled", v)} disabled={!canManage} />
            </div>
            {canManage && (
              <div className="col-span-2">
                <Button type="submit" disabled={formState.isSubmitting}>
                  Save WhatsApp settings
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function BillingTab() {
  const { data: tenant } = useTenant();
  const { hasPermission } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const startCheckout = async (plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE") => {
    setLoadingPlan(plan);
    try {
      const res = await api.post<{ url: string }>("/billing/subscription/checkout", { plan });
      window.location.href = res.url;
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Checkout is not available yet");
    } finally {
      setLoadingPlan(null);
    }
  };

  const openPortal = async () => {
    try {
      const res = await api.post<{ url: string }>("/billing/subscription/portal");
      window.location.href = res.url;
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Billing portal is not available yet");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Current plan: <Badge variant="secondary">{tenant?.subscription?.plan ?? "—"}</Badge>{" "}
          <Badge variant={tenant?.subscription?.status === "ACTIVE" ? "success" : "outline"}>
            {tenant?.subscription?.status ?? "—"}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPermission("SUBSCRIPTION_MANAGE") ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PRICING_PLANS.map((plan) => {
                const isCurrent = tenant?.subscription?.plan === plan.id;
                return (
                  <Card key={plan.id} className={plan.highlighted ? "border-primary shadow-sm" : undefined}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-base">
                        {plan.name}
                        {isCurrent && <Badge variant="success">Current</Badge>}
                      </CardTitle>
                      <CardDescription>{plan.tagline}</CardDescription>
                      <p className="pt-1 text-lg font-semibold">{formatPlanPrice(plan)}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-1.5">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {plan.priceMad === null ? (
                        <Button className="w-full" variant={isCurrent ? "outline" : "default"} disabled={isCurrent} asChild={!isCurrent}>
                          {isCurrent ? (
                            "Current plan"
                          ) : (
                            <a href="mailto:sales@mbnhealth.com?subject=Enterprise%20plan%20inquiry">
                              <CreditCard className="h-3.5 w-3.5" /> Contact sales
                            </a>
                          )}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={isCurrent ? "outline" : "default"}
                          disabled={isCurrent || loadingPlan === plan.id}
                          onClick={() => startCheckout(plan.id)}
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          {isCurrent ? "Current plan" : `Upgrade to ${plan.name}`}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Button variant="ghost" onClick={openPortal}>
              Manage billing & invoices
            </Button>
            <p className="text-xs text-muted-foreground">
              Checkout requires Stripe to be configured by the platform operator (STRIPE_SECRET_KEY and price IDs) —
              until then this will show a clear error instead of pretending to charge you.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Only the clinic owner can manage billing.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "profile";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, clinic, and security preferences.</p>
      </div>
      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="clinic">Clinic</TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Bot
          </TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="clinic">
          <ClinicTab />
        </TabsContent>
        <TabsContent value="whatsapp">
          <WhatsAppTab />
        </TabsContent>
        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
