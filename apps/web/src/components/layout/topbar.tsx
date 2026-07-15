"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/lib/auth-context";
import { initials, formatDateTime } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import { useCommandPalette } from "@/components/layout/command-palette-context";
import { useNotifications, useUnreadNotificationCount } from "@/hooks/use-notifications";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { t } = useLocale();
  const { setOpen: setCommandPaletteOpen } = useCommandPalette();

  const { data: unread } = useUnreadNotificationCount();
  const { data: notifications } = useNotifications();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent sm:flex"
        >
          <Search className="h-4 w-4" />
          <span>{t("dashboard.topbar.searchPlaceholder")}</span>
          <kbd className="ml-6 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <LanguageSwitcher size="icon" />
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {!!unread?.count && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">{t("dashboard.topbar.notifications")}</span>
              {!!unread?.count && (
                <Badge variant="secondary">{t("dashboard.topbar.newCount", { count: unread.count })}</Badge>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className={`border-b border-border px-4 py-3 text-sm ${!n.isRead ? "bg-accent/40" : ""}`}>
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t("dashboard.topbar.allCaughtUp")}</p>
              )}
            </div>
            <button
              onClick={() => router.push("/notifications")}
              className="w-full border-t border-border px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-accent"
            >
              {t("dashboard.topbar.viewAll")}
            </button>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-md p-1 hover:bg-accent">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{initials(user?.firstName, user?.lastName)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs font-normal text-muted-foreground">{user?.roleName}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>{t("dashboard.topbar.settings")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()} className="text-destructive">
              {t("dashboard.topbar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
