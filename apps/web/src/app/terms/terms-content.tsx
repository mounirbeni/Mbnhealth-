"use client";

import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { useLocale } from "@/lib/i18n/locale-context";

export default function TermsOfServiceContent() {
  const { t } = useLocale();

  return (
    <LegalPageShell title={t("legal.terms.title")}>
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
        <a href="mailto:contact@mbndev.ma" className="text-primary hover:underline">
          contact@mbndev.ma
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
