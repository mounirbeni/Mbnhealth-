"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Calendar,
  ChevronRight,
  Info,
  Moon,
  Sun,
  TriangleAlert,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerChildren } from "@/lib/motion";

const COLOR_ROLES: { token: string; className: string }[] = [
  { token: "background / foreground", className: "bg-background text-foreground border border-border" },
  { token: "card", className: "bg-card text-card-foreground border border-border" },
  { token: "primary", className: "bg-primary text-primary-foreground" },
  { token: "secondary", className: "bg-secondary text-secondary-foreground" },
  { token: "muted", className: "bg-muted text-muted-foreground" },
  { token: "accent", className: "bg-accent text-accent-foreground" },
  { token: "destructive", className: "bg-destructive text-destructive-foreground" },
  { token: "success", className: "bg-success text-success-foreground" },
  { token: "warning", className: "bg-warning text-warning-foreground" },
];

function ColorSwatchGrid({ forcedTheme }: { forcedTheme: "light" | "dark" }) {
  return (
    <div className={cn(forcedTheme === "dark" && "dark")}>
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-3">
        {COLOR_ROLES.map((role) => (
          <div key={role.token} className={cn("flex h-16 flex-col justify-between rounded-lg p-2 text-xs font-medium", role.className)}>
            <span>{role.token}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <div>
        <h2 className="text-section-title">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme();
  const [previewDir, setPreviewDir] = React.useState<"ltr" | "rtl">("ltr");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [loadingDemo, setLoadingDemo] = React.useState(true);

  // Living style-guide/reference for the design system — dev and preview
  // only, never shipped to real users.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  // Set dir on <html> itself, not just a wrapper div: Radix portals
  // (Sheet/Select/Tooltip/Dialog) render into document.body, escaping any
  // local wrapper, so only the document-level dir actually mirrors them.
  React.useEffect(() => {
    const previous = document.documentElement.dir;
    document.documentElement.dir = previewDir;
    return () => {
      document.documentElement.dir = previous;
    };
  }, [previewDir]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-page-title">MBN Health — Design System</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Living reference for tokens, primitives, and motion. Dev/preview only — 404s in production.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewDir((d) => (d === "ltr" ? "rtl" : "ltr"))}
            >
              Preview: {previewDir.toUpperCase()}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="hidden h-4 w-4 dark:block" />
            </Button>
          </div>
        </header>

        <nav className="mb-10 flex flex-wrap gap-2">
          {["colors", "type", "spacing", "motion", "components"].map((id) => (
            <a key={id} href={`#${id}`} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium capitalize text-muted-foreground hover:bg-accent hover:text-foreground">
              {id}
            </a>
          ))}
        </nav>

        <div className="space-y-14">
          <Section id="colors" title="Color roles" description="Semantic tokens, shown in both themes side by side.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-caption font-medium uppercase tracking-wide text-muted-foreground">Light</p>
                <ColorSwatchGrid forcedTheme="light" />
              </div>
              <div>
                <p className="mb-2 text-caption font-medium uppercase tracking-wide text-muted-foreground">Dark</p>
                <ColorSwatchGrid forcedTheme="dark" />
              </div>
            </div>
          </Section>

          <Section id="type" title="Typography" description="Marketing display scale plus the in-app UI scale.">
            <div className="space-y-3 rounded-xl border border-border bg-card p-6">
              <p className="text-display-lg">Display LG 56</p>
              <p className="text-display">Display 44</p>
              <p className="text-display-sm">Display SM 34</p>
              <Separator />
              <p className="text-page-title">Page title 24 — dashboard/section headers</p>
              <p className="text-section-title">Section title 16 — card/group headers</p>
              <p className="text-body">Body 14 — default running text</p>
              <p className="text-caption text-muted-foreground">Caption 12 — hints, timestamps, metadata</p>
            </div>
          </Section>

          <Section id="spacing" title="Radius &amp; elevation" description="Border radius steps and the tinted shadow scale.">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(
                [
                  ["sm", "rounded-sm"],
                  ["md", "rounded-md"],
                  ["lg", "rounded-lg"],
                  ["xl", "rounded-xl"],
                ] as const
              ).map(([label, className]) => (
                <div key={label} className={cn("flex h-20 items-center justify-center border border-border bg-card text-xs text-muted-foreground", className)}>
                  radius-{label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(
                [
                  ["xs", "shadow-xs"],
                  ["sm", "shadow-sm"],
                  ["md", "shadow-md"],
                  ["lg", "shadow-lg"],
                ] as const
              ).map(([label, className]) => (
                <div key={label} className={cn("flex h-20 items-center justify-center rounded-lg border border-border bg-card text-xs text-muted-foreground", className)}>
                  shadow-{label}
                </div>
              ))}
            </div>
          </Section>

          <Section id="motion" title="Motion" description="Shared easing/duration from lib/motion.ts, demoed live.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-section-title">fadeInUp + stagger</CardTitle>
                  <CardDescription>Re-mounts on click.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MotionDemoKey render={(key) => (
                    <motion.ul key={key} variants={staggerChildren} initial="hidden" animate="visible" className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <motion.li key={i} variants={fadeInUp} className="rounded-md bg-muted px-3 py-2 text-sm">
                          Item {i}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-section-title">scaleIn</CardTitle>
                  <CardDescription>Re-mounts on click.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MotionDemoKey render={(key) => (
                    <motion.div key={key} variants={scaleIn} initial="hidden" animate="visible" className="rounded-md bg-primary/10 px-3 py-6 text-center text-sm text-primary">
                      Scales + fades in
                    </motion.div>
                  )} />
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section id="components" title="Components">
            <Tabs defaultValue="buttons">
              <TabsList className="flex-wrap">
                <TabsTrigger value="buttons">Buttons</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="forms">Forms</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="overlays">Overlays</TabsTrigger>
              </TabsList>

              <TabsContent value="buttons" className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {(["default", "secondary", "outline", "ghost", "destructive", "link"] as const).map((v) => (
                    <Button key={v} variant={v}>
                      {v}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="badges" className="flex flex-wrap gap-3">
                {(["default", "secondary", "outline", "destructive", "success", "warning"] as const).map((v) => (
                  <Badge key={v} variant={v}>
                    {v}
                  </Badge>
                ))}
              </TabsContent>

              <TabsContent value="forms" className="max-w-sm space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ds-input">Patient name</Label>
                  <Input id="ds-input" placeholder="Amina El Fassi" />
                </div>
                <div className="space-y-1.5">
                  <Label>Clinic</Label>
                  <Select defaultValue="marrakech">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marrakech">Marrakech Central</SelectItem>
                      <SelectItem value="fes">Fès Médina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ds-switch">Notifications</Label>
                  <Switch id="ds-switch" defaultChecked />
                </div>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Default</AlertTitle>
                  <AlertDescription>Neutral informational message.</AlertDescription>
                </Alert>
                <Alert variant="success">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>The record was saved.</AlertDescription>
                </Alert>
                <Alert variant="warning">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>This patient has an outstanding balance.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Failed to update the appointment status.</AlertDescription>
                </Alert>

                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setLoadingDemo((v) => !v)}>
                    Toggle
                  </Button>
                </div>
                {!loadingDemo && <p className="text-sm text-muted-foreground">(loaded state)</p>}
              </TabsContent>

              <TabsContent value="overlays" className="flex flex-wrap items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Patient profile</TooltipContent>
                </Tooltip>

                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      Open sheet <ChevronRight className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="end">
                    <SheetHeader>
                      <SheetTitle>Appointment details</SheetTitle>
                      <SheetDescription>Slides in from the logical "end" side — right in LTR, left in RTL.</SheetDescription>
                    </SheetHeader>
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <Avatar>
                        <AvatarFallback>AE</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Amina El Fassi</p>
                        <p className="text-caption text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Today, 14:30
                        </p>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </TabsContent>
            </Tabs>
          </Section>
        </div>
      </div>
    </TooltipProvider>
  );
}

function MotionDemoKey({ render }: { render: (key: number) => React.ReactNode }) {
  const [key, setKey] = React.useState(0);
  return (
    <div className="space-y-3">
      {render(key)}
      <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
        Replay
      </Button>
    </div>
  );
}
