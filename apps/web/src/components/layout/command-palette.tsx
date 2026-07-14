"use client";

import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Command,
  CommandDialogOverlay,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/lib/nav-config";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n/locale-context";
import { useCommandPalette } from "@/components/layout/command-palette-context";

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();
  const { hasPermission, logout } = useAuth();
  const { setTheme } = useTheme();
  const { t } = useLocale();

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <CommandDialogOverlay open={open} onOpenChange={setOpen}>
      <Command className="shadow-2xl">
        <CommandInput autoFocus placeholder={t("dashboard.commandPalette.searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("dashboard.commandPalette.noResults")}</CommandEmpty>
          <CommandGroup heading={t("dashboard.commandPalette.navigate")}>
            {NAV_ITEMS.filter((item) => hasPermission(item.permission)).map((item) => (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <item.icon className="h-4 w-4" />
                {t(`dashboard.nav.${item.labelKey}`)}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t("dashboard.commandPalette.actions")}>
            <CommandItem
              onSelect={() => {
                setTheme("light");
                setOpen(false);
              }}
            >
              <Sun className="h-4 w-4" /> {t("dashboard.commandPalette.lightMode")}
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setTheme("dark");
                setOpen(false);
              }}
            >
              <Moon className="h-4 w-4" /> {t("dashboard.commandPalette.darkMode")}
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                logout();
              }}
              className="text-destructive"
            >
              <LogOut className="h-4 w-4" /> {t("dashboard.commandPalette.logout")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialogOverlay>
  );
}
