import { useQuery } from "@tanstack/react-query";
import { portalApi } from "@/lib/portal-api-client";

export function usePortalAppointments() {
  return useQuery({ queryKey: ["portal", "appointments"], queryFn: () => portalApi.get<any[]>("/portal/appointments") });
}

export function usePortalMedicalRecords() {
  return useQuery({
    queryKey: ["portal", "medical-records"],
    queryFn: () => portalApi.get<any[]>("/portal/medical-records"),
  });
}

export function usePortalPrescriptions() {
  return useQuery({
    queryKey: ["portal", "prescriptions"],
    queryFn: () => portalApi.get<any[]>("/portal/prescriptions"),
  });
}

export function usePortalInvoices() {
  return useQuery({ queryKey: ["portal", "invoices"], queryFn: () => portalApi.get<any[]>("/portal/invoices") });
}

export function usePortalLabOrders() {
  return useQuery({ queryKey: ["portal", "lab-orders"], queryFn: () => portalApi.get<any[]>("/portal/lab-orders") });
}

export function usePortalRadiologyOrders() {
  return useQuery({
    queryKey: ["portal", "radiology-orders"],
    queryFn: () => portalApi.get<any[]>("/portal/radiology-orders"),
  });
}
