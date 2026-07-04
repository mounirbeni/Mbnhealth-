"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { NAV_ITEMS } from "@/lib/nav-config";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { user, hasPermission, logout } = useAuth();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-24" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg animate-fade-in">
        <Command
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl",
          )}
        >
          <Command.Input
            autoFocus
            placeholder="Search pages, patients, actions..."
            className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>
            <Command.Group heading="Navigate" className="px-2 py-1 text-xs font-medium text-muted-foreground">
              {NAV_ITEMS.filter(
                (item) => hasPermission(item.permission) && (user?.tenantId || item.href.startsWith("/admin")),
              ).map((item) => (
                <Command.Item
                  key={item.href}
                  onSelect={() => go(item.href)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Actions" className="px-2 py-1 text-xs font-medium text-muted-foreground">
              <Command.Item
                onSelect={() => {
                  setTheme("light");
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
              >
                <Sun className="h-4 w-4" /> Switch to light mode
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setTheme("dark");
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
              >
                <Moon className="h-4 w-4" /> Switch to dark mode
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive data-[selected=true]:bg-accent"
              >
                <LogOut className="h-4 w-4" /> Log out
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
