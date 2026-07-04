import { BadRequestException, Injectable } from "@nestjs/common";
import { DEFAULT_ROLE_PERMISSIONS, SubscriptionPlan, SubscriptionStatus, SystemRoleName } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";

export interface ProvisionTenantParams {
  clinicName: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: Date;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  passwordHash: string;
  ownerRole: SystemRoleName;
}

/** Creates a tenant, seeds its default roles, and creates its owner user in
 * one transaction. Shared by self-service registration and admin-created
 * clinics so the two flows can't drift apart. */
@Injectable()
export class TenantProvisioningService {
  constructor(private readonly prisma: PrismaService) {}

  async generateUniqueSlug(clinicName: string): Promise<string> {
    const base =
      clinicName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48) || "clinic";

    let slug = base;
    let suffix = 1;
    while (await this.prisma.tenant.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }

  async provision(params: ProvisionTenantParams) {
    const slug = await this.generateUniqueSlug(params.clinicName);

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: params.clinicName,
          slug,
          city: params.city,
          address: params.address,
          phone: params.phone,
          email: params.email,
          website: params.website,
          subscription: {
            create: {
              plan: params.plan,
              status: params.subscriptionStatus,
              trialEndsAt: params.trialEndsAt,
            },
          },
        },
      });

      const roleRecords = await Promise.all(
        (Object.keys(DEFAULT_ROLE_PERMISSIONS) as SystemRoleName[])
          .filter((r) => r !== SystemRoleName.SUPER_ADMIN)
          .map((systemRole) => {
            const name = systemRole
              .split("_")
              .map((w) => w[0] + w.slice(1).toLowerCase())
              .join(" ");
            return tx.role.create({
              data: {
                tenantId: tenant.id,
                name,
                systemRole,
                isSystem: true,
                permissions: DEFAULT_ROLE_PERMISSIONS[systemRole],
              },
            });
          }),
      );

      const ownerRoleRecord = roleRecords.find((r) => r.systemRole === params.ownerRole);
      if (!ownerRoleRecord) throw new BadRequestException("select a valid role");

      const owner = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: params.ownerEmail.toLowerCase(),
          passwordHash: params.passwordHash,
          firstName: params.ownerFirstName,
          lastName: params.ownerLastName,
          phone: params.phone,
          roleId: ownerRoleRecord.id,
        },
        include: { role: true },
      });

      return { tenant, owner };
    });
  }
}
