import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { TenantsService } from "./tenants.service";
import { UpdateTenantDto } from "./dto/update-tenant.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { AuditLog } from "../common/decorators/audit-log.decorator";

@Controller("tenants")
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get("me")
  getOwn(@CurrentUser() user: AuthenticatedUser) {
    return this.tenantsService.getOwn(user.tenantId!);
  }

  @Patch("me")
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  @AuditLog("Tenant")
  updateOwn(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.updateOwn(user.tenantId!, dto);
  }

  // ── Platform (Super Admin) ────────────────────────────────────────────────
  @Get()
  @RequirePermissions(Permission.SYSTEM_MANAGE_TENANTS)
  findAll(@Query("search") search?: string, @Query("page") page = "1", @Query("pageSize") pageSize = "25") {
    return this.tenantsService.findAll({ search, page: +page, pageSize: +pageSize });
  }

  @Patch(":id/status")
  @RequirePermissions(Permission.SYSTEM_MANAGE_TENANTS)
  setStatus(@Param("id") id: string, @Body("status") status: "ACTIVE" | "SUSPENDED" | "ARCHIVED") {
    return this.tenantsService.setStatus(id, status);
  }
}
