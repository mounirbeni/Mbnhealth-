"use client";

import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocale } from "@/lib/i18n/locale-context";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <EmptyState
        icon={FileQuestion}
        title={t("common.notFoundPage.title")}
        description={t("common.notFoundPage.description")}
        action={{ label: t("common.notFoundPage.goHome"), href: "/" }}
      />
    </div>
  );
}
