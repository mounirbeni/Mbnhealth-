type BadgeVariant = "default" | "secondary" | "destructive" | "success" | "warning" | "outline";

export const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  // Appointments
  CONFIRMED: "default",
  WAITING: "warning",
  CHECKED_IN: "secondary",
  IN_CONSULTATION: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
  EMERGENCY: "destructive",
  // Invoices
  DRAFT: "outline",
  SENT: "secondary",
  PARTIALLY_PAID: "warning",
  PAID: "success",
  OVERDUE: "destructive",
  VOID: "outline",
  // Orders
  ORDERED: "secondary",
  IN_PROGRESS: "warning",
  // Prescriptions
  ACTIVE: "default",
  // Insurance claims
  SUBMITTED: "secondary",
  IN_REVIEW: "warning",
  APPROVED: "success",
  PARTIALLY_APPROVED: "warning",
  REJECTED: "destructive",
};
