import { useQuery } from "@tanstack/react-query";
import { API_URL, api, getAccessToken } from "@/lib/api-client";

export function useRevenueReport() {
  return useQuery({ queryKey: ["reports", "revenue"], queryFn: () => api.get<any>("/reports/revenue") });
}

export function useAppointmentsReport() {
  return useQuery({ queryKey: ["reports", "appointments"], queryFn: () => api.get<any>("/reports/appointments") });
}

export function usePatientsReport() {
  return useQuery({ queryKey: ["reports", "patients"], queryFn: () => api.get<any>("/reports/patients") });
}

export function useDoctorsReport() {
  return useQuery({ queryKey: ["reports", "doctors"], queryFn: () => api.get<any[]>("/reports/doctors") });
}

export function useFinancialReport() {
  return useQuery({ queryKey: ["reports", "financial"], queryFn: () => api.get<any>("/reports/financial") });
}

export function useInventoryReport() {
  return useQuery({ queryKey: ["reports", "inventory"], queryFn: () => api.get<any>("/reports/inventory") });
}

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
