import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface DashboardOverview {
  todayAppointmentsTotal: number;
  appointmentsByStatus: Record<string, number>;
  totalPatients: number;
  totalDoctors: number;
  revenueThisMonth: number;
  outstandingBalance: number;
  pendingLabOrders: number;
  lowStockItemsCount: number;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => api.get<DashboardOverview>("/dashboard/overview"),
  });
}

export function useRevenueTrend(months = 6) {
  return useQuery({
    queryKey: ["dashboard", "revenue-trend", months],
    queryFn: () => api.get<{ month: string; revenue: number }[]>(`/dashboard/revenue-trend?months=${months}`),
  });
}

export function useAppointmentsTrend(days = 14) {
  return useQuery({
    queryKey: ["dashboard", "appointments-trend", days],
    queryFn: () => api.get<{ date: string; count: number }[]>(`/dashboard/appointments-trend?days=${days}`),
  });
}

export function useUpcomingAppointments(limit = 6) {
  return useQuery({
    queryKey: ["dashboard", "upcoming", limit],
    queryFn: () =>
      api.get<any[]>(`/dashboard/upcoming-appointments?limit=${limit}`),
  });
}

export function useDoctorPerformance() {
  return useQuery({
    queryKey: ["dashboard", "doctor-performance"],
    queryFn: () => api.get<{ doctorId: string; name: string; appointmentsCount: number }[]>("/dashboard/doctor-performance"),
  });
}
