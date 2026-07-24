"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/nav-config";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

// The four highest-traffic destinations get a permanent tab; everything else
// lives in the "More" drawer so the bar reads like a native app, not a menu.
const PRIMARY_TAB_HREFS = ["/dashboard", "/appointments", "/patients", "/messages"];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  const { t } = useLocale();
  const [moreOpen, setMoreOpen] = useState(false);

  const allowed = NAV_ITEMS.filter((item) => hasPermission(item.permission));
  const primary = PRIMARY_TAB_HREFS
    .map((href) => allowed.find((item) => item.href === href))
    .filter((item): item is NonNullable<typeof item> => !!item)
    .slice(0, 4);
  const secondary = allowed.filter((item) => !primary.includes(item));
  const moreActive = secondary.some((item) => isActive(pathname, item.href));

  return (
    <nav
      aria-label={t("dashboard.nav.more")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {primary.map(({ href, icon: Icon, labelKey }) => {
          const active = isActive(pathname, href);
          const label = t(`dashboard.nav.${labelKey}`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}

        {secondary.length > 0 && (
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  moreActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <LayoutGrid className="h-5 w-5" strokeWidth={moreActive ? 2.25 : 2} />
                <span className="truncate">{t("dashboard.nav.more")}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <SheetHeader>
                <SheetTitle className="text-start text-sm font-semibold text-muted-foreground">
                  {t("dashboard.nav.moreSheetTitle")}
                </SheetTitle>
                <SheetDescription className="sr-only">{t("dashboard.nav.moreSheetTitle")}</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-2">
                {secondary.map(({ href, icon: Icon, labelKey }) => {
                  const active = isActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-center text-[11px] font-medium transition-colors",
                        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="line-clamp-2 leading-tight">{t(`dashboard.nav.${labelKey}`)}</span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
}
