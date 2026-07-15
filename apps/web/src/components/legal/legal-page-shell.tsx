"use client";

import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/i18n/locale-context";
import { INTL_LOCALE_TAGS } from "@/lib/i18n/locales";

export function LegalPageShell({
  title,
  showUpdatedDate = true,
  children,
}: {
  title: string;
  showUpdatedDate?: boolean;
  children: React.ReactNode;
}) {
  const { t, locale } = useLocale();
  const updatedDate = new Date().toLocaleDateString(INTL_LOCALE_TAGS[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">MBN Health</span>
          </Link>
          <LanguageSwitcher size="icon" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("common.back")}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {showUpdatedDate && (
          <p className="mt-2 text-sm text-muted-foreground">{t("legal.lastUpdated", { date: updatedDate })}</p>
        )}

        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
          {children}
        </div>
      </main>
    </div>
  );
}
