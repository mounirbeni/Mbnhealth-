import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { SystemRoleName } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { TenantProvisioningService } from "./tenant-provisioning.service";
import { UpdateTenantDto } from "./dto/update-tenant.dto";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { AdminUpdateTenantDto } from "./dto/admin-update-tenant.dto";

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provisioning: TenantProvisioningService,
  ) {}

  async getOwn(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true },
    });
    if (!tenant) throw new NotFoundException("Tenant not found");
    return tenant;
  }

  async updateOwn(tenantId: string, dto: UpdateTenantDto) {
    await this.getOwn(tenantId);
    return this.prisma.tenant.update({ where: { id: tenantId }, data: dto });
  }

  // ── Platform (Super Admin) ────────────────────────────────────────────────

  async findAll(params: { search?: string; page: number; pageSize: number }) {
    const where = params.search
      ? { name: { contains: params.search, mode: "insensitive" as const } }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        include: { subscription: true, _count: { select: { users: true, patients: true } } },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      this.prisma.tenant.count({ where }),
    ]);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  async getPlatformStats() {
    const [statusCounts, totalUsers, totalPatients] = await Promise.all([
      this.prisma.tenant.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.user.count({ where: { tenantId: { not: null } } }),
      this.prisma.patient.count(),
    ]);

    const byStatus: Record<string, number> = { ACTIVE: 0, SUSPENDED: 0, ARCHIVED: 0 };
    for (const row of statusCounts) byStatus[row.status] = row._count._all;

    return {
      totalClinics: byStatus.ACTIVE + byStatus.SUSPENDED + byStatus.ARCHIVED,
      activeClinics: byStatus.ACTIVE,
      suspendedClinics: byStatus.SUSPENDED,
      archivedClinics: byStatus.ARCHIVED,
      totalUsers,
      totalPatients,
    };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { subscription: true, _count: { select: { users: true, patients: true } } },
    });
    if (!tenant) throw new NotFoundException("Tenant not found");
    return tenant;
  }

  async setStatus(tenantId: string, status: "ACTIVE" | "SUSPENDED" | "ARCHIVED") {
    await this.findOne(tenantId);
    return this.prisma.tenant.update({ where: { id: tenantId }, data: { status } });
  }

  async createByAdmin(dto: CreateTenantDto) {
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.ownerEmail.toLowerCase() } });
    if (existingEmail) throw new ConflictException("An account with this email already exists");

    const passwordHash = await argon2.hash(dto.password);
    const { tenant } = await this.provisioning.provision({
      clinicName: dto.name,
      city: dto.city,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
      website: dto.website,
      plan: dto.plan,
      subscriptionStatus: "ACTIVE",
      ownerEmail: dto.ownerEmail,
      ownerFirstName: dto.ownerFirstName,
      ownerLastName: dto.ownerLastName,
      passwordHash,
      ownerRole: SystemRoleName.CLINIC_OWNER,
    });

    return this.findOne(tenant.id);
  }

  async updateByAdmin(id: string, dto: AdminUpdateTenantDto) {
    await this.findOne(id);
    const { plan, seats, ...tenantFields } = dto;

    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(tenantFields).length > 0) {
        await tx.tenant.update({ where: { id }, data: tenantFields });
      }
      if (plan !== undefined || seats !== undefined) {
        await tx.subscription.update({
          where: { tenantId: id },
          data: {
            ...(plan !== undefined ? { plan } : {}),
            ...(seats !== undefined ? { seats } : {}),
          },
        });
      }
    });

    return this.findOne(id);
  }
}
