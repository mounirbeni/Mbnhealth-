"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { usePortalAuth } from "@/lib/portal-auth-context";

export default function PortalAuthLayout({ children }: { children: React.ReactNode }) {
  const { patient, isLoading } = usePortalAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && patient) {
      router.replace("/portal");
    }
  }, [isLoading, patient, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HeartPulse className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">MBN Health Patient Portal</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
