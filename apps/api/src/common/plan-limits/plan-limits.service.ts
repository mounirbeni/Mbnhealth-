import { ForbiddenException, Injectable } from "@nestjs/common";
import { PLAN_LIMITS, SubscriptionPlan, SystemRoleName, planLimitLabel } from "@mbn/database";
import { PrismaService } from "../../prisma/prisma.service";

type LimitedResource = "doctors" | "staff" | "patients";

const RESOURCE_LABEL: Record<LimitedResource, string> = {
  doctors: "doctors",
  staff: "staff accounts",
  patients: "patients",
};

@Injectable()
export class PlanLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Throws when creating one more of `resource` would exceed the tenant's
   * current subscription plan. Call this before the create, inside the same
   * flow — it does not lock, so a tenant right at the boundary could race
   * two near-simultaneous creates past the limit by one; acceptable for a
   * seat/plan cap that gets corrected on the next check.
   */
  async assertWithinLimit(tenantId: string, resource: LimitedResource): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId } });
    const plan: SubscriptionPlan = subscription?.plan ?? "TRIAL";
    const limits = PLAN_LIMITS[plan];
    const max =
      resource === "doctors" ? limits.maxDoctors : resource === "staff" ? limits.maxStaff : limits.maxPatients;
    if (max === null) return;

    const count = await this.countResource(tenantId, resource);
    if (count >= max) {
      throw new ForbiddenException(
        `Your ${plan} plan is limited to ${planLimitLabel(max)} ${RESOURCE_LABEL[resource]}. Upgrade your plan to add more.`,
      );
    }
  }

  private countResource(tenantId: string, resource: LimitedResource) {
    if (resource === "doctors") {
      return this.prisma.doctor.count({ where: { tenantId, user: { isActive: true } } });
    }
    if (resource === "patients") {
      return this.prisma.patient.count({ where: { tenantId } });
    }
    return this.prisma.user.count({
      where: { tenantId, isActive: true, role: { systemRole: { not: SystemRoleName.DOCTOR } } },
    });
  }
}
