"use client";

import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { useLocale } from "@/lib/i18n/locale-context";

export default function AboutContent() {
  const { t } = useLocale();

  return (
    <LegalPageShell title={t("legal.about.title")} showUpdatedDate={false}>
      <p>{t("legal.about.intro")}</p>

      <h2>{t("legal.about.missionHeading")}</h2>
      <p>{t("legal.about.missionBody")}</p>

      <h2>{t("legal.about.whyHeading")}</h2>
      <ul className="ml-5 list-disc space-y-1">
        <li>{t("legal.about.whyItem1")}</li>
        <li>{t("legal.about.whyItem2")}</li>
        <li>{t("legal.about.whyItem3")}</li>
        <li>{t("legal.about.whyItem4")}</li>
      </ul>

      <h2>{t("legal.about.contactHeading")}</h2>
      <p>
        {t("legal.about.contactBodyBefore")}{" "}
        <a href="mailto:contact@mbndev.ma" className="text-primary hover:underline">
          contact@mbndev.ma
        </a>{" "}
        {t("legal.about.contactBodyMiddle")}{" "}
        <a href="tel:+212601439975" className="text-primary hover:underline">
          +212 601 439 975
        </a>
        {t("legal.about.contactBodyAfter")}
      </p>
    </LegalPageShell>
  );
}
