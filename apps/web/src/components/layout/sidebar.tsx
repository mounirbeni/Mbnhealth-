"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav-config";
import { useAuth } from "@/lib/auth-context";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();

  // Super Admins (no tenantId) have every permission by design, but every
  // non-/admin page is scoped to a clinic they don't have — hide those
  // instead of linking to pages that error for them.
  const items = NAV_ITEMS.filter(
    (item) => hasPermission(item.permission) && (user?.tenantId || item.href.startsWith("/admin")),
  );

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">MBN Health</span>
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
