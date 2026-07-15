"use client";

import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { useLocale } from "@/lib/i18n/locale-context";

export default function CancellationPolicyContent() {
  const { t } = useLocale();

  return (
    <LegalPageShell title={t("legal.cancellation.title")}>
      <p>{t("legal.cancellation.intro")}</p>

      <h2>{t("legal.cancellation.trialHeading")}</h2>
      <p>{t("legal.cancellation.trialBody")}</p>

      <h2>{t("legal.cancellation.billingHeading")}</h2>
      <p>{t("legal.cancellation.billingBody")}</p>

      <h2>{t("legal.cancellation.cancelHeading")}</h2>
      <p>{t("legal.cancellation.cancelBody")}</p>

      <h2>{t("legal.cancellation.refundHeading")}</h2>
      <p>
        {t("legal.cancellation.refundBodyBefore")}{" "}
        <a href="mailto:contact@mbndev.ma" className="text-primary hover:underline">
          contact@mbndev.ma
        </a>{" "}
        {t("legal.cancellation.refundBodyAfter")}
      </p>

      <h2>{t("legal.cancellation.contactHeading")}</h2>
      <p>
        {t("legal.cancellation.contactBodyBefore")}{" "}
        <a href="mailto:contact@mbndev.ma" className="text-primary hover:underline">
          contact@mbndev.ma
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
