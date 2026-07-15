import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string } | null;
}

export interface AuditLogParams {
  page: number;
  pageSize: number;
  entityType?: string;
  userId?: string;
}

export function useAuditLogs(params: AuditLogParams) {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));
  if (params.entityType) query.set("entityType", params.entityType);
  if (params.userId) query.set("userId", params.userId);

  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => api.get<{ items: AuditLogEntry[]; total: number; page: number; pageSize: number }>(`/audit-logs?${query.toString()}`),
  });
}
