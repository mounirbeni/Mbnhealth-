import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Appointment } from "@/types";

export function useAppointments(params: { from?: string; to?: string; doctorId?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.doctorId) query.set("doctorId", params.doctorId);
  if (params.status) query.set("status", params.status);

  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => api.get<Appointment[]>(`/appointments?${query.toString()}`),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<Appointment>("/appointments", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.patch<Appointment>(`/appointments/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, cancelReason }: { id: string; status: string; cancelReason?: string }) =>
      api.patch<Appointment>(`/appointments/${id}/status`, { status, cancelReason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useWaitlist() {
  return useQuery({
    queryKey: ["appointments", "waitlist"],
    queryFn: () => api.get<any[]>("/appointments/waitlist"),
  });
}
