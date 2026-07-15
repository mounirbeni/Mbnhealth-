"use client";

import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { useLocale } from "@/lib/i18n/locale-context";

export default function CookiePolicyContent() {
  const { t } = useLocale();

  return (
    <LegalPageShell title={t("legal.cookies.title")}>
      <p>{t("legal.cookies.intro")}</p>

      <h2>{t("legal.cookies.essentialHeading")}</h2>
      <p>{t("legal.cookies.essentialBody")}</p>

      <h2>{t("legal.cookies.localStorageHeading")}</h2>
      <p>{t("legal.cookies.localStorageBody")}</p>

      <h2>{t("legal.cookies.noTrackingHeading")}</h2>
      <p>{t("legal.cookies.noTrackingBody")}</p>

      <h2>{t("legal.cookies.controlHeading")}</h2>
      <p>{t("legal.cookies.controlBody")}</p>

      <h2>{t("legal.cookies.contactHeading")}</h2>
      <p>
        {t("legal.cookies.contactBodyBefore")}{" "}
        <a href="mailto:contact@mbndev.ma" className="text-primary hover:underline">
          contact@mbndev.ma
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
