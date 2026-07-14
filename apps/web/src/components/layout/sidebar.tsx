"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_SECTIONS } from "@/lib/nav-config";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const COLLAPSE_STORAGE_KEY = "mbn.sidebar.collapsed";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
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
        "flex h-full flex-col border-r border-border bg-card rtl:border-l rtl:border-r-0 transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 border-b border-border", collapsed ? "justify-center px-2" : "px-5")}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-4 w-4" />
        </div>
        {!collapsed && <span className="text-sm font-semibold tracking-tight">MBN Health</span>}
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => {
          const sectionItems = items.filter((item) => item.section === section);
          if (sectionItems.length === 0) return null;
          return (
            <div key={section} className="mb-4 last:mb-0">
              {!collapsed && (
                <p className="mb-1 px-3 text-caption font-medium uppercase tracking-wide text-muted-foreground/70">
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
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && label}
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
