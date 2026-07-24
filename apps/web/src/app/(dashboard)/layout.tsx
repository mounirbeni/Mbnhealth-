"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { CommandPalette } from "@/components/layout/command-palette";
import { CommandPaletteProvider } from "@/components/layout/command-palette-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
          {/* Desktop/tablet: side rail. Mobile: bottom tab bar instead. */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="scrollbar-thin flex-1 overflow-y-auto p-4 pb-24 sm:p-6 md:pb-6">
              {/* Re-keying on route change gives every page the same soft
                  entrance without per-page wiring. */}
              <div key={pathname} className="mx-auto max-w-screen-2xl animate-fade-in-up [animation-duration:250ms]">
                {children}
              </div>
            </main>
          </div>

          <MobileTabBar />
          <CommandPalette />
        </div>
      </CommandPaletteProvider>
    </TooltipProvider>
  );
}
