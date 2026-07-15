import { Activity } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grid-fade relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 py-12">
      <div className="absolute right-4 top-4 rtl:right-auto rtl:left-4">
        <LanguageSwitcher size="icon" />
      </div>
      <div className="relative mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">MBN Health</span>
      </div>
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
