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
import { PRICING_PLANS } from "@/lib/pricing";
import { useLocale } from "@/lib/i18n/locale-context";

const PLAN_FEATURE_KEYS: Record<string, string[]> = {
  STARTER: ["starterFeature1", "starterFeature2", "starterFeature3", "starterFeature4", "starterFeature5", "starterFeature6"],
  PROFESSIONAL: [
    "professionalFeature1",
    "professionalFeature2",
    "professionalFeature3",
    "professionalFeature4",
    "professionalFeature5",
    "professionalFeature6",
  ],
  ENTERPRISE: [
    "enterpriseFeature1",
    "enterpriseFeature2",
    "enterpriseFeature3",
    "enterpriseFeature4",
    "enterpriseFeature5",
    "enterpriseFeature6",
  ],
};
const PLAN_NAME_KEYS: Record<string, string> = { STARTER: "starterName", PROFESSIONAL: "professionalName", ENTERPRISE: "enterpriseName" };
const PLAN_TAGLINE_KEYS: Record<string, string> = {
  STARTER: "starterTagline",
  PROFESSIONAL: "professionalTagline",
  ENTERPRISE: "enterpriseTagline",
};

function ProfileTab() {
  const { user } = useAuth();
  const { t } = useLocale();
  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle>{t("dashboard.settings.profile.title")}</CardTitle>
        <CardDescription>{t("dashboard.settings.profile.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>{t("dashboard.settings.profile.firstNameLabel")}</Label>
          <Input value={user?.firstName ?? ""} disabled />
        </div>
        <div className="space-y-1.5">
          <Label>{t("dashboard.settings.profile.lastNameLabel")}</Label>
          <Input value={user?.lastName ?? ""} disabled />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>{t("dashboard.settings.profile.emailLabel")}</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="space-y-1.5">
          <Label>{t("dashboard.settings.profile.roleLabel")}</Label>
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
  const { t } = useLocale();
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
    <Card className="surface-card">
      <CardHeader>
        <CardTitle>{t("dashboard.settings.clinic.title")}</CardTitle>
        <CardDescription>
          {t("dashboard.settings.clinic.planLabel")} <Badge variant="secondary">{tenant?.subscription?.plan ?? "—"}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await updateTenant.mutateAsync(v);
              toast.success(t("dashboard.settings.clinic.updatedToast"));
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.settings.clinic.updateFailedToast"));
            }
          })}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2 space-y-1.5">
            <Label>{t("dashboard.settings.clinic.clinicNameLabel")}</Label>
            <Input {...register("name")} disabled={!hasPermission("SETTINGS_MANAGE")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>{t("dashboard.settings.clinic.addressLabel")}</Label>
            <Input {...register("address")} disabled={!hasPermission("SETTINGS_MANAGE")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.settings.clinic.cityLabel")}</Label>
            <Input
              {...register("city")}
              placeholder={t("dashboard.settings.clinic.cityPlaceholder")}
              disabled={!hasPermission("SETTINGS_MANAGE")}
            />
            <p className="text-xs text-muted-foreground">{t("dashboard.settings.clinic.cityHelper")}</p>
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.settings.clinic.phoneLabel")}</Label>
            <Input {...register("phone")} disabled={!hasPermission("SETTINGS_MANAGE")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.settings.clinic.emailLabel")}</Label>
            <Input {...register("email")} disabled={!hasPermission("SETTINGS_MANAGE")} />
          </div>
          {hasPermission("SETTINGS_MANAGE") && (
            <div className="col-span-2">
              <Button type="submit" disabled={formState.isSubmitting}>
                {t("dashboard.settings.clinic.saveChanges")}
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
  const { t } = useLocale();
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
      toast.error(e instanceof ApiError ? e.message : t("dashboard.settings.security.mfaSetupFailedToast"));
    }
  };

  const confirmMfa = async () => {
    try {
      await api.post("/auth/mfa/confirm", { code });
      toast.success(t("dashboard.settings.security.mfaEnabledToast"));
      setSetupData(null);
      setCode("");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t("dashboard.settings.security.mfaInvalidCodeToast"));
    }
  };

  const disableMfa = async () => {
    try {
      await api.post("/auth/mfa/disable");
      toast.success(t("dashboard.settings.security.mfaDisabledToast"));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t("dashboard.settings.security.mfaDisableFailedToast"));
    }
  };

  const revokeSession = async (id: string) => {
    await api.delete(`/auth/sessions/${id}`);
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  return (
    <div className="space-y-4">
      <Card className="surface-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("dashboard.settings.security.twoFactorTitle")}</CardTitle>
            <CardDescription>{t("dashboard.settings.security.twoFactorDesc")}</CardDescription>
          </div>
          <Switch checked={!!user} disabled />
        </CardHeader>
        <CardContent>
          {setupData ? (
            <div className="space-y-3">
              <div className="inline-flex rounded-xl border border-border bg-muted/30 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setupData.qrCodeDataUrl}
                  alt={t("dashboard.settings.security.qrAlt")}
                  className="h-40 w-40 rounded-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.settings.security.manualCodeLabel", { secret: setupData.secret })}
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder={t("dashboard.settings.security.codePlaceholder")}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                />
                <Button onClick={confirmMfa}>{t("dashboard.settings.security.confirm")}</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={startMfaSetup}>
                <ShieldCheck className="h-4 w-4" /> {t("dashboard.settings.security.enable2fa")}
              </Button>
              <Button variant="outline" onClick={disableMfa}>
                {t("dashboard.settings.security.disable2fa")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>{t("dashboard.settings.security.activeSessionsTitle")}</CardTitle>
          <CardDescription>{t("dashboard.settings.security.activeSessionsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {sessions && sessions.length > 0 ? (
            sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{s.userAgent ?? t("dashboard.settings.security.unknownDevice")}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.ipAddress} ·{" "}
                      {t("dashboard.settings.security.lastActive", { date: formatDateTime(s.lastActiveAt) })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => revokeSession(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">{t("dashboard.settings.security.noActiveSessions")}</p>
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
  const { t } = useLocale();
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
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>{t("dashboard.settings.whatsapp.title")}</CardTitle>
          <CardDescription>
            {t("dashboard.settings.whatsapp.descBefore")}{" "}
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-primary hover:underline"
            >
              {t("dashboard.settings.whatsapp.metaLink")} <ExternalLink className="h-3 w-3" />
            </a>{" "}
            {t("dashboard.settings.whatsapp.descAfter")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 text-xs">
            <p className="font-medium">{t("dashboard.settings.whatsapp.webhookLabel")}</p>
            <code className="mt-1 block break-all rounded bg-background px-2 py-1">{webhookUrl}</code>
          </div>
          <form
            onSubmit={handleSubmit(async (v) => {
              try {
                const payload = { ...v, accessToken: v.accessToken || undefined };
                if (!payload.accessToken) delete (payload as any).accessToken;
                await upsertConfig.mutateAsync(payload);
                toast.success(t("dashboard.settings.whatsapp.savedToast"));
              } catch (e) {
                toast.error(e instanceof ApiError ? e.message : t("dashboard.settings.whatsapp.saveFailedToast"));
              }
            })}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumberId">{t("dashboard.settings.whatsapp.phoneNumberIdLabel")}</Label>
              <Input id="phoneNumberId" {...register("phoneNumberId", { required: true })} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayPhoneNumber">{t("dashboard.settings.whatsapp.displayPhoneLabel")}</Label>
              <Input
                id="displayPhoneNumber"
                {...register("displayPhoneNumber")}
                placeholder="+212 522 000 000"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessAccountId">{t("dashboard.settings.whatsapp.businessAccountIdLabel")}</Label>
              <Input id="businessAccountId" {...register("businessAccountId")} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accessToken">
                {t("dashboard.settings.whatsapp.accessTokenLabel")}
                {config && t("dashboard.settings.whatsapp.accessTokenKeepCurrent")}
              </Label>
              <Input
                id="accessToken"
                type="password"
                {...register("accessToken", { required: !config })}
                disabled={!canManage}
              />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{t("dashboard.settings.whatsapp.connectionActive")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.settings.whatsapp.connectionActiveDesc")}</p>
              </div>
              <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} disabled={!canManage} />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{t("dashboard.settings.whatsapp.aiReplies")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.settings.whatsapp.aiRepliesDesc")}</p>
              </div>
              <Switch checked={watch("aiBotEnabled")} onCheckedChange={(v) => setValue("aiBotEnabled", v)} disabled={!canManage} />
            </div>
            {canManage && (
              <div className="col-span-2">
                <Button type="submit" disabled={formState.isSubmitting}>
                  {t("dashboard.settings.whatsapp.save")}
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
  const { t } = useLocale();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const startCheckout = async (plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE") => {
    setLoadingPlan(plan);
    try {
      const res = await api.post<{ url: string }>("/billing/subscription/checkout", { plan });
      window.location.href = res.url;
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t("dashboard.settings.billing.checkoutFailedToast"));
    } finally {
      setLoadingPlan(null);
    }
  };

  const openPortal = async () => {
    try {
      const res = await api.post<{ url: string }>("/billing/subscription/portal");
      window.location.href = res.url;
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t("dashboard.settings.billing.portalFailedToast"));
    }
  };

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle>{t("dashboard.settings.billing.title")}</CardTitle>
        <CardDescription>
          {t("dashboard.settings.billing.currentPlan")} <Badge variant="secondary">{tenant?.subscription?.plan ?? "—"}</Badge>{" "}
          <Badge variant={tenant?.subscription?.status === "ACTIVE" ? "success" : "outline"}>
            {tenant?.subscription?.status ? t(`tenantStatus.${tenant.subscription.status}`) : "—"}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPermission("SUBSCRIPTION_MANAGE") ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PRICING_PLANS.map((plan) => {
                const isCurrent = tenant?.subscription?.plan === plan.id;
                const planName = t(`marketing.pricing.${PLAN_NAME_KEYS[plan.id]}`);
                return (
                  <Card key={plan.id} className={plan.highlighted ? "border-primary shadow-sm" : undefined}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-base">
                        {planName}
                        {isCurrent && <Badge variant="success">{t("dashboard.settings.billing.current")}</Badge>}
                      </CardTitle>
                      <CardDescription>{t(`marketing.pricing.${PLAN_TAGLINE_KEYS[plan.id]}`)}</CardDescription>
                      <p className="pt-1 text-lg font-semibold">
                        {plan.priceMad === null
                          ? t("marketing.pricing.customPricing")
                          : t("marketing.pricing.perMonth", { price: plan.priceMad })}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {PLAN_FEATURE_KEYS[plan.id].map((key) => (
                          <li key={key} className="flex items-start gap-1.5">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            {t(`marketing.pricing.${key}`)}
                          </li>
                        ))}
                      </ul>
                      {plan.priceMad === null ? (
                        <Button className="w-full" variant={isCurrent ? "outline" : "default"} disabled={isCurrent} asChild={!isCurrent}>
                          {isCurrent ? (
                            t("dashboard.settings.billing.currentPlanButton")
                          ) : (
                            <a href="mailto:sales@mbnhealth.com?subject=Enterprise%20plan%20inquiry">
                              <CreditCard className="h-3.5 w-3.5" /> {t("dashboard.settings.billing.contactSales")}
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
                          {isCurrent
                            ? t("dashboard.settings.billing.currentPlanButton")
                            : t("dashboard.settings.billing.upgradeToButton", { name: planName })}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Button variant="ghost" onClick={openPortal}>
              {t("dashboard.settings.billing.manageBilling")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("dashboard.settings.billing.checkoutNote")}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("dashboard.settings.billing.ownerOnly")}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "profile";
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-page-title">{t("dashboard.settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.settings.subtitle")}</p>
      </div>
      <Tabs defaultValue={defaultTab} orientation="vertical" className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <TabsList className="h-auto w-full shrink-0 justify-start overflow-x-auto bg-transparent p-0 lg:w-56 lg:flex-col lg:items-stretch">
          <TabsTrigger value="profile" className="justify-start data-[state=active]:bg-accent lg:w-full">
            {t("dashboard.settings.profileTab")}
          </TabsTrigger>
          <TabsTrigger value="clinic" className="justify-start data-[state=active]:bg-accent lg:w-full">
            {t("dashboard.settings.clinicTab")}
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="justify-start data-[state=active]:bg-accent lg:w-full">
            <MessageCircle className="h-3.5 w-3.5" /> {t("dashboard.settings.whatsappTab")}
          </TabsTrigger>
          <TabsTrigger value="billing" className="justify-start data-[state=active]:bg-accent lg:w-full">
            {t("dashboard.settings.billingTab")}
          </TabsTrigger>
          <TabsTrigger value="security" className="justify-start data-[state=active]:bg-accent lg:w-full">
            {t("dashboard.settings.securityTab")}
          </TabsTrigger>
        </TabsList>
        <div className="min-w-0 flex-1">
          <TabsContent value="profile" className="mt-0">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="clinic" className="mt-0">
            <ClinicTab />
          </TabsContent>
          <TabsContent value="whatsapp" className="mt-0">
            <WhatsAppTab />
          </TabsContent>
          <TabsContent value="billing" className="mt-0">
            <BillingTab />
          </TabsContent>
          <TabsContent value="security" className="mt-0">
            <SecurityTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
