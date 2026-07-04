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
import { UsersService } from "../users/users.service";

@Controller("tenants")
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly auditLogService: AuditLogService,
    private readonly usersService: UsersService,
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

  @Get("stats")
  @RequirePermissions(Permission.SYSTEM_MANAGE_TENANTS)
  getStats() {
    return this.tenantsService.getPlatformStats();
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

  @Get(":id/users")
  @RequirePermissions(Permission.SYSTEM_MANAGE_TENANTS)
  listUsers(@Param("id") id: string, @Query("search") search?: string) {
    return this.usersService.findAll(id, { search });
  }

  @Patch(":id/users/:userId/status")
  @RequirePermissions(Permission.SYSTEM_MANAGE_TENANTS)
  @AuditLog("User")
  @AuditTenantFromParam("id")
  setUserStatus(@Param("id") id: string, @Param("userId") userId: string, @Body("isActive") isActive: boolean) {
    return this.usersService.update(id, userId, { isActive });
  }
}
