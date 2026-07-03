import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { PaginatedResult, Patient } from "@/types";

export function usePatients(params: { search?: string; page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 20));

  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => api.get<PaginatedResult<Patient>>(`/patients?${query.toString()}`),
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => api.get<Patient>(`/patients/${id}`),
    enabled: !!id,
  });
}

export function usePatientTimeline(id: string | undefined) {
  return useQuery({
    queryKey: ["patients", id, "timeline"],
    queryFn: () => api.get<any[]>(`/patients/${id}/timeline`),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<Patient>("/patients", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useAddAllergy(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { substance: string; reaction?: string; severity?: string }) =>
      api.post(`/patients/${patientId}/allergies`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients", patientId] }),
  });
}

export function useAddMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; dosage?: string; frequency?: string }) =>
      api.post(`/patients/${patientId}/medications`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients", patientId] }),
  });
}

export function useAddVital(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, number>) => api.post(`/patients/${patientId}/vitals`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients", patientId] }),
  });
}
