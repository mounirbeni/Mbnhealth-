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
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/types";

export type NavSection = "overview" | "care" | "operations" | "admin";

export interface NavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  section: NavSection;
}

export const NAV_SECTIONS: NavSection[] = ["overview", "care", "operations", "admin"];

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "DASHBOARD_VIEW", section: "overview" },
  { labelKey: "doctorWorkspace", href: "/doctor", icon: ClipboardList, permission: "MEDICAL_RECORDS_WRITE", section: "care" },
  { labelKey: "appointments", href: "/appointments", icon: CalendarDays, permission: "APPOINTMENTS_READ", section: "care" },
  { labelKey: "patients", href: "/patients", icon: Users, permission: "PATIENTS_READ", section: "care" },
  { labelKey: "doctors", href: "/doctors", icon: Stethoscope, permission: "DOCTORS_READ", section: "care" },
  { labelKey: "departments", href: "/departments", icon: Building2, permission: "DOCTORS_READ", section: "care" },
  { labelKey: "medicalRecords", href: "/medical-records", icon: FileText, permission: "MEDICAL_RECORDS_READ", section: "care" },
  { labelKey: "laboratory", href: "/lab", icon: FlaskConical, permission: "LAB_READ", section: "care" },
  { labelKey: "radiology", href: "/radiology", icon: Scan, permission: "RADIOLOGY_READ", section: "care" },
  { labelKey: "billing", href: "/billing", icon: Receipt, permission: "BILLING_READ", section: "operations" },
  { labelKey: "inventory", href: "/inventory", icon: Package, permission: "INVENTORY_READ", section: "operations" },
  { labelKey: "reports", href: "/reports", icon: BarChart3, permission: "REPORTS_VIEW", section: "operations" },
  { labelKey: "messages", href: "/messages", icon: MessageSquare, permission: "MESSAGES_READ", section: "operations" },
  { labelKey: "staff", href: "/staff", icon: UserCog, permission: "STAFF_MANAGE", section: "admin" },
  { labelKey: "auditLogs", href: "/audit-logs", icon: ShieldCheck, permission: "AUDIT_LOG_VIEW", section: "admin" },
  { labelKey: "settings", href: "/settings", icon: Settings, permission: "SETTINGS_MANAGE", section: "admin" },
];
