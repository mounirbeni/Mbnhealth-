import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  timezone: string;
  subscription?: { plan: string; status: string; trialEndsAt?: string | null };
}

export function useTenant() {
  return useQuery({
    queryKey: ["tenant"],
    queryFn: () => api.get<Tenant>("/tenants/me"),
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Tenant>) => api.patch<Tenant>("/tenants/me", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant"] }),
  });
}
