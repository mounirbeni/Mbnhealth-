import { Injectable } from "@nestjs/common";
import { AuditAction } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";

export interface RecordAuditEntryInput {
  tenantId: string | null;
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditEntryInput) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata as any,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  async findForTenant(
    tenantId: string,
    params: { page: number; pageSize: number; entityType?: string; userId?: string },
  ) {
    const where = {
      tenantId,
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...(params.userId ? { userId: params.userId } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }
}
