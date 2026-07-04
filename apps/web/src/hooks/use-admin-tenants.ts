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

export function useAdminTenant(id: string) {
  return useQuery({
    queryKey: ["admin-tenants", id],
    queryFn: () => api.get<any>(`/tenants/${id}`),
    enabled: !!id,
  });
}

export function useAdminTenantAuditLogs(id: string, page = 1) {
  return useQuery({
    queryKey: ["admin-tenants", id, "audit-logs", page],
    queryFn: () => api.get<any>(`/tenants/${id}/audit-logs?page=${page}&pageSize=25`),
    enabled: !!id,
  });
}

export function useSetTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "SUSPENDED" | "ARCHIVED" }) =>
      api.patch(`/tenants/${id}/status`, { status }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-tenants"] });
      qc.invalidateQueries({ queryKey: ["admin-tenants", variables.id] });
    },
  });
}

export interface CreateTenantInput {
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  plan: "TRIAL" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  password: string;
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTenantInput) => api.post("/tenants", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tenants"] }),
  });
}

export interface UpdateTenantDetailsInput {
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  plan?: "TRIAL" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  seats?: number;
}

export function useUpdateTenantDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTenantDetailsInput & { id: string }) => api.patch(`/tenants/${id}`, input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-tenants"] });
      qc.invalidateQueries({ queryKey: ["admin-tenants", variables.id] });
    },
  });
}
