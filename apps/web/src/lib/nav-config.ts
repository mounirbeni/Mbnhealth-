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
  labelKey: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "DASHBOARD_VIEW" },
  { labelKey: "appointments", href: "/appointments", icon: CalendarDays, permission: "APPOINTMENTS_READ" },
  { labelKey: "patients", href: "/patients", icon: Users, permission: "PATIENTS_READ" },
  { labelKey: "doctors", href: "/doctors", icon: Stethoscope, permission: "DOCTORS_READ" },
  { labelKey: "departments", href: "/departments", icon: Building2, permission: "DOCTORS_READ" },
  { labelKey: "medicalRecords", href: "/medical-records", icon: FileText, permission: "MEDICAL_RECORDS_READ" },
  { labelKey: "laboratory", href: "/lab", icon: FlaskConical, permission: "LAB_READ" },
  { labelKey: "radiology", href: "/radiology", icon: Scan, permission: "RADIOLOGY_READ" },
  { labelKey: "billing", href: "/billing", icon: Receipt, permission: "BILLING_READ" },
  { labelKey: "inventory", href: "/inventory", icon: Package, permission: "INVENTORY_READ" },
  { labelKey: "reports", href: "/reports", icon: BarChart3, permission: "REPORTS_VIEW" },
  { labelKey: "messages", href: "/messages", icon: MessageSquare, permission: "MESSAGES_READ" },
  { labelKey: "staff", href: "/staff", icon: UserCog, permission: "STAFF_MANAGE" },
  { labelKey: "auditLogs", href: "/audit-logs", icon: ShieldCheck, permission: "AUDIT_LOG_VIEW" },
  { labelKey: "settings", href: "/settings", icon: Settings, permission: "SETTINGS_MANAGE" },
];
