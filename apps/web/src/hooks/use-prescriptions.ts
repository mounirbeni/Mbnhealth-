import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function usePrescriptions(params: { status?: string } = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  return useQuery({
    queryKey: ["prescriptions", params],
    queryFn: () => api.get<any[]>(`/prescriptions?${query.toString()}`),
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/prescriptions", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prescriptions"] }),
  });
}

export function useUpdatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "cancel" | "complete" }) =>
      api.patch(`/prescriptions/${id}/${action}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prescriptions"] }),
  });
}
