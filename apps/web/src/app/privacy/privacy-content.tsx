"use client";

import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { useLocale } from "@/lib/i18n/locale-context";

export default function PrivacyPolicyContent() {
  const { t } = useLocale();

  return (
    <LegalPageShell title={t("legal.privacy.title")}>
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
    </LegalPageShell>
  );
}
