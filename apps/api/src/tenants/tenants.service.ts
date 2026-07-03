import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateTenantDto } from "./dto/update-tenant.dto";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

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

  // Super Admin: platform-wide tenant management
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

  async setStatus(tenantId: string, status: "ACTIVE" | "SUSPENDED" | "ARCHIVED") {
    return this.prisma.tenant.update({ where: { id: tenantId }, data: { status } });
  }
}
