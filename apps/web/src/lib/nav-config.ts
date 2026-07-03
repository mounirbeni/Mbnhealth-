import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  Building2,
  FlaskConical,
  Scan,
  Receipt,
  Package,
  BarChart3,
  MessageSquare,
  UserCog,
  ShieldCheck,
  Settings,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "DASHBOARD_VIEW" },
  { label: "Appointments", href: "/appointments", icon: CalendarDays, permission: "APPOINTMENTS_READ" },
  { label: "Patients", href: "/patients", icon: Users, permission: "PATIENTS_READ" },
  { label: "Doctors", href: "/doctors", icon: Stethoscope, permission: "DOCTORS_READ" },
  { label: "Departments", href: "/departments", icon: Building2, permission: "DOCTORS_READ" },
  { label: "Medical Records", href: "/medical-records", icon: FileText, permission: "MEDICAL_RECORDS_READ" },
  { label: "Laboratory", href: "/lab", icon: FlaskConical, permission: "LAB_READ" },
  { label: "Radiology", href: "/radiology", icon: Scan, permission: "RADIOLOGY_READ" },
  { label: "Billing", href: "/billing", icon: Receipt, permission: "BILLING_READ" },
  { label: "Inventory", href: "/inventory", icon: Package, permission: "INVENTORY_READ" },
  { label: "Reports", href: "/reports", icon: BarChart3, permission: "REPORTS_VIEW" },
  { label: "Messages", href: "/messages", icon: MessageSquare, permission: "MESSAGES_READ" },
  { label: "Staff", href: "/staff", icon: UserCog, permission: "STAFF_MANAGE" },
  { label: "Audit Logs", href: "/audit-logs", icon: ShieldCheck, permission: "AUDIT_LOG_VIEW" },
  { label: "Settings", href: "/settings", icon: Settings, permission: "SETTINGS_MANAGE" },
];
