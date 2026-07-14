"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { CommandPaletteProvider } from "@/components/layout/command-palette-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-context";
import { X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.systemRole === "SUPER_ADMIN") {
      // The regular dashboard assumes a tenant-scoped user throughout
      // (branding, billing, staff...); a platform super admin has no tenant
      // of their own and belongs in the platform admin panel instead.
      router.replace("/admin");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.systemRole === "SUPER_ADMIN") return null;

  return (
    <TooltipProvider delayDuration={200}>
      <CommandPaletteProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {mobileOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
              <div className="relative">
                <Sidebar onNavigate={() => setMobileOpen(false)} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-[-2.5rem] top-3 rounded-md bg-background/90 p-1.5 text-foreground rtl:right-auto rtl:left-[-2.5rem]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar onMenuClick={() => setMobileOpen(true)} />
            <main className="scrollbar-thin flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mx-auto max-w-screen-2xl">{children}</div>
            </main>
          </div>
          <CommandPalette />
        </div>
      </CommandPaletteProvider>
    </TooltipProvider>
  );
}
