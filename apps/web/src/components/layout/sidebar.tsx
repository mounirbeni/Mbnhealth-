"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_SECTIONS } from "@/lib/nav-config";
import { useAuth } from "@/lib/auth-context";
import { useTenant } from "@/hooks/use-tenant";
import { useLocale } from "@/lib/i18n/locale-context";
import { transitionBase } from "@/lib/motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const COLLAPSE_STORAGE_KEY = "mbn.sidebar.collapsed";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  const { data: tenant } = useTenant();
  const { t, dir } = useLocale();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (stored === "1" || stored === "0") {
      setCollapsed(stored === "1");
      return;
    }
    // No explicit preference yet: default to the collapsed rail on
    // tablet-width viewports, full sidebar on desktop and up.
    setCollapsed(window.matchMedia("(max-width: 1023px)").matches);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const items = NAV_ITEMS.filter((item) => hasPermission(item.permission));

  return (
    <div
      className={cn(
        "flex h-full flex-col border-e border-border bg-card transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex h-14 shrink-0 items-center gap-2.5 border-b border-border", collapsed ? "justify-center px-2" : "px-4")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/75 text-primary-foreground shadow-sm">
          <Activity className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold tracking-tight">{tenant?.name ?? "MBN Health"}</p>
            {tenant?.name && <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">MBN Health</p>}
          </div>
        )}
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => {
          const sectionItems = items.filter((item) => item.section === section);
          if (sectionItems.length === 0) return null;
          return (
            <div key={section} className="mb-5 last:mb-0">
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
                  {t(`dashboard.navSections.${section}`)}
                </p>
              )}
              <ul className="space-y-0.5">
                {sectionItems.map((item) => {
                  const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                  const Icon = item.icon;
                  const label = t(`dashboard.nav.${item.labelKey}`);
                  const link = (
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active ? "text-primary" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          transition={transitionBase}
                          className="absolute inset-0 rounded-lg bg-primary/10"
                        />
                      )}
                      <Icon
                        className={cn(
                          "relative h-4 w-4 shrink-0 transition-transform duration-200",
                          !active && "group-hover:scale-110",
                        )}
                      />
                      {!collapsed && <span className="relative">{label}</span>}
                    </Link>
                  );
                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side={dir === "rtl" ? "left" : "right"}>{label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className={cn("border-t border-border p-2", collapsed ? "flex justify-center" : "flex justify-end")}>
        <button
          onClick={toggleCollapsed}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
          ) : (
            <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
          )}
        </button>
      </div>
    </div>
  );
}
