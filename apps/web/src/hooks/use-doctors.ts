import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Doctor } from "@/types";

export function useDoctors(params: { departmentId?: string; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.departmentId) query.set("departmentId", params.departmentId);
  if (params.search) query.set("search", params.search);

  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () => api.get<Doctor[]>(`/doctors?${query.toString()}`),
  });
}

export function useDoctor(id: string | undefined) {
  return useQuery({
    queryKey: ["doctors", id],
    queryFn: () => api.get<Doctor>(`/doctors/${id}`),
    enabled: !!id,
  });
}
