"use client";

import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/use-notifications";
import { formatDateTime } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

export default function NotificationsPage() {
  const { t } = useLocale();
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const hasUnread = notifications?.some((n) => !n.isRead);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title">{t("dashboard.notifications.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.notifications.subtitle")}</p>
        </div>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            {t("dashboard.notifications.markAllRead")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="surface-card divide-y divide-border overflow-hidden">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markRead.mutate(n.id)}
              className={`flex w-full items-start gap-3 px-4 py-3.5 text-start transition-colors hover:bg-accent/40 ${
                !n.isRead ? "bg-accent/20" : ""
              }`}
            >
              <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? "bg-primary" : "bg-transparent"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState icon={notifications ? BellOff : Bell} title={t("dashboard.notifications.empty")} />
      )}
    </div>
  );
}
