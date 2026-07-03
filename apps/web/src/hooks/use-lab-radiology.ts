import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useLabOrders() {
  return useQuery({ queryKey: ["lab-orders"], queryFn: () => api.get<any[]>("/lab-orders") });
}

export function useCreateLabOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/lab-orders", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab-orders"] }),
  });
}

export function useUpdateLabOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, data }: { id: string; action: "start" | "complete" | "cancel"; data?: Record<string, unknown> }) =>
      api.patch(`/lab-orders/${id}/${action}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab-orders"] }),
  });
}

export function useRadiologyOrders() {
  return useQuery({ queryKey: ["radiology-orders"], queryFn: () => api.get<any[]>("/radiology-orders") });
}

export function useCreateRadiologyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/radiology-orders", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["radiology-orders"] }),
  });
}

export function useUpdateRadiologyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, data }: { id: string; action: "start" | "complete" | "cancel"; data?: Record<string, unknown> }) =>
      api.patch(`/radiology-orders/${id}/${action}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["radiology-orders"] }),
  });
}
