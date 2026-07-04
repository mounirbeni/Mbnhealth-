import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useAdminTenants(params: { search?: string; page?: number; pageSize?: number } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 25));

  return useQuery({
    queryKey: ["admin-tenants", params],
    queryFn: () => api.get<any>(`/tenants?${query.toString()}`),
  });
}

export function useSetTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "SUSPENDED" | "ARCHIVED" }) =>
      api.patch(`/tenants/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tenants"] }),
  });
}
