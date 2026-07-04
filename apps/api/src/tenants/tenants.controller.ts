import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { TenantsService } from "./tenants.service";
import { UpdateTenantDto } from "./dto/update-tenant.dto";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { AdminUpdateTenantDto } from "./dto/admin-update-tenant.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { AuditLog, AuditTenantFromParam, AuditTenantFromResult } from "../common/decorators/audit-log.decorator";
import { AuditLogService } from "../audit-log/audit-log.service";

@Controller("tenants")
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly auditLogService: AuditLogService,
  ) {}

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

  @Post()
  @RequirePermissions(Permission.SYSTEM_MANAGE_TENANTS)
  @AuditLog("Tenant")
  @AuditTenantFromResult()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.createByAdmin(dto);
  }

  @Get(":id")
  @RequirePermissions(Permission.SYSTEM_MANAGE_TENANTS)
  findOne(@Param("id") id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions(Permission.SYSTEM_MANAGE_TENANTS)
  @AuditLog("Tenant")
  @AuditTenantFromParam("id")
  updateByAdmin(@Param("id") id: string, @Body() dto: AdminUpdateTenantDto) {
    return this.tenantsService.updateByAdmin(id, dto);
  }

  @Get(":id/audit-logs")
  @RequirePermissions(Permission.SYSTEM_MANAGE_TENANTS)
  auditLogs(
    @Param("id") id: string,
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "25",
    @Query("entityType") entityType?: string,
  ) {
    return this.auditLogService.findForTenant(id, { page: +page, pageSize: +pageSize, entityType });
  }

  @Patch(":id/status")
  @RequirePermissions(Permission.SYSTEM_MANAGE_TENANTS)
  @AuditLog("Tenant")
  @AuditTenantFromParam("id")
  setStatus(@Param("id") id: string, @Body("status") status: "ACTIVE" | "SUSPENDED" | "ARCHIVED") {
    return this.tenantsService.setStatus(id, status);
  }
}
