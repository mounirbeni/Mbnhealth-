import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { DepartmentsService } from "./departments.service";
import { CreateDepartmentDto, UpdateDepartmentDto } from "./dto/department.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { AuditLog } from "../common/decorators/audit-log.decorator";

@Controller("departments")
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.departmentsService.findAll(user.tenantId!);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.departmentsService.findOne(user.tenantId!, id);
  }

  @Post()
  @RequirePermissions(Permission.DEPARTMENTS_MANAGE)
  @AuditLog("Department")
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(user.tenantId!, dto);
  }

  @Patch(":id")
  @RequirePermissions(Permission.DEPARTMENTS_MANAGE)
  @AuditLog("Department")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(user.tenantId!, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(Permission.DEPARTMENTS_MANAGE)
  @AuditLog("Department")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.departmentsService.remove(user.tenantId!, id);
  }
}
