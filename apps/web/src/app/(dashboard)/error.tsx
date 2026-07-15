"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocale } from "@/lib/i18n/locale-context";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLocale();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <EmptyState
        icon={TriangleAlert}
        title={t("common.error")}
        description={t("common.errorDescription")}
        action={{ label: t("common.tryAgain"), onClick: reset }}
      />
    </div>
  );
}
