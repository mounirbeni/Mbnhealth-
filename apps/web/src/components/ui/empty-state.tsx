import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptyStateVariants = cva("flex flex-col items-center gap-2 rounded-lg border border-dashed border-border text-center", {
  variants: {
    size: {
      default: "gap-3 rounded-2xl py-16",
      sm: "gap-2 py-8",
    },
  },
  defaultVariants: { size: "default" },
});

export interface EmptyStateProps extends VariantProps<typeof emptyStateVariants> {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, size, className }: EmptyStateProps) {
  return (
    <div className={cn(emptyStateVariants({ size }), className)}>
      <Icon className={cn("text-muted-foreground", size === "sm" ? "h-6 w-6" : "h-8 w-8")} />
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action &&
        (action.href ? (
          <Button variant="outline" size="sm" asChild>
            <a href={action.href}>{action.label}</a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}
