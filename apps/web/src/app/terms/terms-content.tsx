"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/i18n/locale-context";
import { INTL_LOCALE_TAGS } from "@/lib/i18n/locales";

export default function TermsOfServiceContent() {
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
        <h1 className="text-3xl font-bold tracking-tight">{t("legal.terms.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("legal.lastUpdated", { date: updatedDate })}</p>

        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
          <p>{t("legal.terms.intro")}</p>

          <h2>{t("legal.terms.accountsHeading")}</h2>
          <p>{t("legal.terms.accountsBody")}</p>

          <h2>{t("legal.terms.plansHeading")}</h2>
          <p>{t("legal.terms.plansBody")}</p>

          <h2>{t("legal.terms.useHeading")}</h2>
          <p>{t("legal.terms.useIntro")}</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>{t("legal.terms.useItem1")}</li>
            <li>{t("legal.terms.useItem2")}</li>
            <li>{t("legal.terms.useItem3")}</li>
            <li>{t("legal.terms.useItem4")}</li>
          </ul>

          <h2>{t("legal.terms.clinicalHeading")}</h2>
          <p>{t("legal.terms.clinicalBody")}</p>

          <h2>{t("legal.terms.availabilityHeading")}</h2>
          <p>{t("legal.terms.availabilityBody")}</p>

          <h2>{t("legal.terms.terminationHeading")}</h2>
          <p>{t("legal.terms.terminationBody")}</p>

          <h2>{t("legal.terms.liabilityHeading")}</h2>
          <p>{t("legal.terms.liabilityBody")}</p>

          <h2>{t("legal.terms.contactHeading")}</h2>
          <p>
            {t("legal.terms.contactBodyBefore")}{" "}
            <a href="mailto:legal@mbnhealth.com" className="text-primary hover:underline">
              legal@mbnhealth.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
