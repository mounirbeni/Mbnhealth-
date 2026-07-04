import { SubscriptionPlan } from "../generated/client";

/**
 * Single source of truth for what each subscription plan is allowed to do.
 * `null` means unlimited. Enforced server-side in DoctorsService, UsersService
 * and PatientsService — see apps/api/src/common/plan-limits.
 */
export interface PlanLimits {
  maxDoctors: number | null;
  maxStaff: number | null;
  maxPatients: number | null;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  // Full-featured trial so prospects experience the Professional tier before paying.
  TRIAL: { maxDoctors: 10, maxStaff: 30, maxPatients: null },
  STARTER: { maxDoctors: 1, maxStaff: 3, maxPatients: 500 },
  PROFESSIONAL: { maxDoctors: 10, maxStaff: 30, maxPatients: null },
  ENTERPRISE: { maxDoctors: null, maxStaff: null, maxPatients: null },
};

export function planLimitLabel(value: number | null): string {
  return value === null ? "Unlimited" : String(value);
}
