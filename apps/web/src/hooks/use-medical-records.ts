import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useMedicalRecords(patientId: string | undefined) {
  return useQuery({
    queryKey: ["medical-records", patientId],
    queryFn: () => api.get<any[]>(`/medical-records?patientId=${patientId}`),
    enabled: !!patientId,
  });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/medical-records", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medical-records"] }),
  });
}

export function useFinalizeMedicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/medical-records/${id}/finalize`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medical-records"] }),
  });
}
