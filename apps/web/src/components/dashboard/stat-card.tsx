import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive";
  hint?: string;
}

const accentClasses = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning-foreground dark:text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, icon: Icon, accent = "primary", hint }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-2 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", accentClasses[accent])}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </CardContent>
    </Card>
  );
}
