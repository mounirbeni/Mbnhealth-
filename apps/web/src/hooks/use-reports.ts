import { useQuery } from "@tanstack/react-query";
import { api, getAccessToken } from "@/lib/api-client";

export interface ReportDateRange {
  from?: string;
  to?: string;
}

function rangeQuery(range?: ReportDateRange) {
  const query = new URLSearchParams();
  if (range?.from) query.set("from", range.from);
  if (range?.to) query.set("to", range.to);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function useRevenueReport(range?: ReportDateRange) {
  return useQuery({
    queryKey: ["reports", "revenue", range],
    queryFn: () => api.get<any>(`/reports/revenue${rangeQuery(range)}`),
  });
}

export function useAppointmentsReport(range?: ReportDateRange) {
  return useQuery({
    queryKey: ["reports", "appointments", range],
    queryFn: () => api.get<any>(`/reports/appointments${rangeQuery(range)}`),
  });
}

export function usePatientsReport() {
  return useQuery({ queryKey: ["reports", "patients"], queryFn: () => api.get<any>("/reports/patients") });
}

export function useDoctorsReport() {
  return useQuery({ queryKey: ["reports", "doctors"], queryFn: () => api.get<any[]>("/reports/doctors") });
}

export function useFinancialReport(range?: ReportDateRange) {
  return useQuery({
    queryKey: ["reports", "financial", range],
    queryFn: () => api.get<any>(`/reports/financial${rangeQuery(range)}`),
  });
}

export function useInventoryReport() {
  return useQuery({ queryKey: ["reports", "inventory"], queryFn: () => api.get<any>("/reports/inventory") });
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function downloadReportCsv(report: "revenue" | "appointments" | "patients") {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/v1/reports/export.csv?report=${report}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report}-report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
