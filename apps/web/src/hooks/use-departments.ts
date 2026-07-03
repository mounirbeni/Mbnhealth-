import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  _count?: { doctors: number; appointments: number };
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get<Department[]>("/departments"),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; color?: string }) =>
      api.post<Department>("/departments", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/departments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}
