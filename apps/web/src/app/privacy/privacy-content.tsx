"use client";

import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/i18n/locale-context";
import { INTL_LOCALE_TAGS } from "@/lib/i18n/locales";

export default function PrivacyPolicyContent() {
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
        <h1 className="text-3xl font-bold tracking-tight">{t("legal.privacy.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("legal.lastUpdated", { date: updatedDate })}</p>

        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
          <p>{t("legal.privacy.intro")}</p>

          <h2>{t("legal.privacy.collectHeading")}</h2>
          <p>{t("legal.privacy.collectIntro")}</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>{t("legal.privacy.collectItem1")}</li>
            <li>{t("legal.privacy.collectItem2")}</li>
            <li>{t("legal.privacy.collectItem3")}</li>
            <li>{t("legal.privacy.collectItem4")}</li>
          </ul>

          <h2>{t("legal.privacy.isolationHeading")}</h2>
          <p>{t("legal.privacy.isolationBody")}</p>

          <h2>{t("legal.privacy.useHeading")}</h2>
          <p>{t("legal.privacy.useIntro")}</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>{t("legal.privacy.useItem1")}</li>
            <li>{t("legal.privacy.useItem2")}</li>
            <li>{t("legal.privacy.useItem3")}</li>
            <li>{t("legal.privacy.useItem4")}</li>
          </ul>

          <h2>{t("legal.privacy.sharingHeading")}</h2>
          <p>{t("legal.privacy.sharingBody")}</p>

          <h2>{t("legal.privacy.retentionHeading")}</h2>
          <p>{t("legal.privacy.retentionBody")}</p>

          <h2>{t("legal.privacy.rightsHeading")}</h2>
          <p>
            {t("legal.privacy.rightsBodyBefore")}{" "}
            <a href="mailto:contact@mbndev.ma" className="text-primary hover:underline">
              contact@mbndev.ma
            </a>{" "}
            {t("legal.privacy.rightsBodyAfter")}
          </p>

          <h2>{t("legal.privacy.contactHeading")}</h2>
          <p>
            {t("legal.privacy.contactBodyBefore")}{" "}
            <a href="mailto:contact@mbndev.ma" className="text-primary hover:underline">
              contact@mbndev.ma
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
