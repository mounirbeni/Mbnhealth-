import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  city?: string | null;
  createdAt: string;
  subscription?: { plan: string; status: string; trialEndsAt?: string | null } | null;
  _count: { users: number; patients: number };
}

interface AdminTenantsResult {
  items: AdminTenant[];
  total: number;
  page: number;
  pageSize: number;
}

// Platform-level tenant directory — only reachable by the SUPER_ADMIN system
// role (see apps/api/src/tenants/tenants.controller.ts's "Platform" section).
export function useAdminTenants(params: { search?: string; page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 25));

  return useQuery({
    queryKey: ["admin-tenants", params],
    queryFn: () => api.get<AdminTenantsResult>(`/tenants?${query.toString()}`),
  });
}

export function useSetTenantStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TenantStatus }) =>
      api.patch(`/tenants/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-tenants"] }),
  });
}
