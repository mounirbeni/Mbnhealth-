"use client";

import { PortalAuthProvider } from "@/lib/portal-auth-context";

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return <PortalAuthProvider>{children}</PortalAuthProvider>;
}
