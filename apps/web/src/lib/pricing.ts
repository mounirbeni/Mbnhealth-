export type PlanId = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export interface PricingPlan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMad: number | null; // null = custom pricing
  features: string[];
  highlighted?: boolean;
}

// Kept in sync by hand with packages/database/src/plan-limits.ts (the
// enforced limits) — this file is display copy only, the API is the
// source of truth for what each plan actually allows.
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "STARTER",
    name: "Starter",
    tagline: "Solo doctor",
    priceMad: 399,
    features: [
      "1 doctor",
      "Up to 3 staff accounts",
      "Up to 500 patients",
      "Basic WhatsApp messaging",
      "Basic reports",
      "Basic support",
    ],
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    tagline: "Small clinic",
    priceMad: 999,
    features: [
      "Up to 10 doctors",
      "Up to 30 staff accounts",
      "Unlimited patients",
      "WhatsApp AI assistant",
      "Advanced analytics",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    tagline: "Hospital / multi-branch",
    priceMad: null,
    features: [
      "Unlimited doctors",
      "Unlimited staff accounts",
      "Unlimited patients",
      "Advanced AI assistant",
      "Custom reports",
      "Dedicated account manager",
    ],
  },
];

export function formatPlanPrice(plan: PricingPlan): string {
  return plan.priceMad === null ? "Custom pricing" : `${plan.priceMad} MAD/mo`;
}
