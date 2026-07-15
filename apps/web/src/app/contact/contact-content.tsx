"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { useLocale } from "@/lib/i18n/locale-context";

export default function ContactContent() {
  const { t } = useLocale();

  return (
    <LegalPageShell title={t("legal.contact.title")} showUpdatedDate={false}>
      <p>{t("legal.contact.intro")}</p>

      <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
        <a
          href="mailto:contact@mbndev.ma"
          className="surface-card surface-card-hover flex items-start gap-3 rounded-xl border border-border p-4"
        >
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">{t("legal.contact.emailHeading")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("legal.contact.emailBody")}</p>
            <p className="mt-2 text-sm font-medium text-primary">contact@mbndev.ma</p>
          </div>
        </a>
        <a
          href="tel:+212601439975"
          className="surface-card surface-card-hover flex items-start gap-3 rounded-xl border border-border p-4"
        >
          <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">{t("legal.contact.phoneHeading")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("legal.contact.phoneBody")}</p>
            <p className="mt-2 text-sm font-medium text-primary">+212 601 439 975</p>
          </div>
        </a>
      </div>

      <h2>{t("legal.contact.demoHeading")}</h2>
      <p>
        {t("legal.contact.demoBodyBefore")}{" "}
        <Link href="/register" className="text-primary hover:underline">
          {t("legal.contact.demoLinkTrial")}
        </Link>{" "}
        {t("legal.contact.demoBodyMiddle")}{" "}
        <Link href="/#contact" className="text-primary hover:underline">
          {t("legal.contact.demoLinkDemo")}
        </Link>{" "}
        {t("legal.contact.demoBodyAfter")}
      </p>
    </LegalPageShell>
  );
}
