import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useInventory() {
  return useQuery({ queryKey: ["inventory"], queryFn: () => api.get<any[]>("/inventory") });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/inventory", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.patch(`/inventory/${id}/adjust`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
