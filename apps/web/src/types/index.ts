// Plain TS mirrors of backend enums/shapes. Kept decoupled from @mbn/database
// (which bundles the Prisma engine) so the browser bundle stays Node-free.

export type Permission =
  | "SYSTEM_MANAGE_TENANTS"
  | "DASHBOARD_VIEW"
  | "PATIENTS_READ"
  | "PATIENTS_WRITE"
  | "PATIENTS_DELETE"
  | "APPOINTMENTS_READ"
  | "APPOINTMENTS_WRITE"
  | "APPOINTMENTS_DELETE"
  | "DOCTORS_READ"
  | "DOCTORS_WRITE"
  | "DEPARTMENTS_MANAGE"
  | "MEDICAL_RECORDS_READ"
  | "MEDICAL_RECORDS_WRITE"
  | "PRESCRIPTIONS_READ"
  | "PRESCRIPTIONS_WRITE"
  | "LAB_READ"
  | "LAB_WRITE"
  | "RADIOLOGY_READ"
  | "RADIOLOGY_WRITE"
  | "BILLING_READ"
  | "BILLING_WRITE"
  | "INSURANCE_MANAGE"
  | "INVENTORY_READ"
  | "INVENTORY_WRITE"
  | "REPORTS_VIEW"
  | "MESSAGES_READ"
  | "MESSAGES_WRITE"
  | "STAFF_MANAGE"
  | "AUDIT_LOG_VIEW"
  | "SETTINGS_MANAGE"
  | "SUBSCRIPTION_MANAGE";

export type AppointmentStatus =
  | "CONFIRMED"
  | "WAITING"
  | "CHECKED_IN"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "EMERGENCY";

export type AppointmentType = "CONSULTATION" | "FOLLOW_UP" | "PROCEDURE" | "CHECKUP" | "EMERGENCY" | "TELEHEALTH";

export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "VOID";

export type PaymentMethod = "CASH" | "CARD" | "INSURANCE" | "BANK_TRANSFER" | "MOBILE_MONEY";

export type OrderStatus = "ORDERED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED";

export interface AuthenticatedUser {
  userId: string;
  tenantId: string | null;
  roleId: string;
  roleName: string;
  systemRole: string | null;
  permissions: Permission[];
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  mfaRequired?: boolean;
  challengeToken?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: AuthenticatedUser;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: Gender;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  bloodType?: string | null;
  avatarUrl?: string | null;
  status: string;
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  createdAt: string;
  allergies?: { id: string; substance: string; reaction?: string | null; severity: string }[];
  medications?: { id: string; name: string; dosage?: string | null; frequency?: string | null; isActive: boolean }[];
  vitals?: {
    id: string;
    recordedAt: string;
    temperatureC?: number | null;
    bloodPressureSystolic?: number | null;
    bloodPressureDiastolic?: number | null;
    heartRate?: number | null;
    weightKg?: number | null;
    heightCm?: number | null;
    bmi?: number | null;
  }[];
  _count?: { appointments: number; invoices: number };
}

export interface Doctor {
  id: string;
  specialization?: string | null;
  licenseNumber?: string | null;
  consultationFee?: number | null;
  department?: { id: string; name: string; color?: string | null } | null;
  user: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string | null; isActive: boolean };
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  type: AppointmentType;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  reason?: string | null;
  notes?: string | null;
  patient: { id: string; firstName: string; lastName: string; avatarUrl?: string | null; phone?: string | null };
  doctor: { id: string; user: { firstName: string; lastName: string; avatarUrl?: string | null } };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  patient: { firstName: string; lastName: string };
  items: { id: string; description: string; quantity: number; unitPrice: number; total: number }[];
  payments: { id: string; amount: number; method: PaymentMethod; paidAt: string }[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
