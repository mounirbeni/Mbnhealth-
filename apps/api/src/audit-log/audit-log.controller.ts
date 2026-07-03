import { Controller, Get, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { AuditLogService } from "./audit-log.service";

@Controller("audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermissions(Permission.AUDIT_LOG_VIEW)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "25",
    @Query("entityType") entityType?: string,
    @Query("userId") userId?: string,
  ) {
    return this.auditLogService.findForTenant(user.tenantId!, {
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      entityType,
      userId,
    });
  }
}
