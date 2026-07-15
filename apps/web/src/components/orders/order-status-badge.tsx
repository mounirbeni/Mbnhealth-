import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { useLocale } from "@/lib/i18n/locale-context";

export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  const { t } = useLocale();
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status] ?? "secondary"} className={className}>
      {t(`workflowStatus.${status}`)}
    </Badge>
  );
}
