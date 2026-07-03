import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Invoice, PaginatedResult } from "@/types";

export function useInvoices(params: { status?: string; page?: number; pageSize?: number } = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 20));

  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => api.get<PaginatedResult<Invoice>>(`/billing/invoices?${query.toString()}`),
  });
}

export function useOutstandingBalance() {
  return useQuery({
    queryKey: ["invoices", "outstanding"],
    queryFn: () => api.get<{ outstanding: number }>("/billing/invoices/outstanding"),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<Invoice>("/billing/invoices", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: Record<string, unknown> }) =>
      api.post(`/billing/invoices/${invoiceId}/payments`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useVoidInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/billing/invoices/${id}/void`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useInsuranceClaims() {
  return useQuery({
    queryKey: ["insurance-claims"],
    queryFn: () => api.get<any[]>("/billing/insurance-claims"),
  });
}

export function useCreateInsuranceClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/billing/insurance-claims", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["insurance-claims"] }),
  });
}
