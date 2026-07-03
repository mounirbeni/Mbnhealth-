import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { AuditLog } from "../common/decorators/audit-log.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(Permission.STAFF_MANAGE)
  findAll(@CurrentUser() user: AuthenticatedUser, @Query("search") search?: string, @Query("roleId") roleId?: string) {
    return this.usersService.findAll(user.tenantId!, { search, roleId });
  }

  @Get("roles")
  listRoles(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.listRoles(user.tenantId!);
  }

  @Get(":id")
  @RequirePermissions(Permission.STAFF_MANAGE)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.usersService.findOne(user.tenantId!, id);
  }

  @Post()
  @RequirePermissions(Permission.STAFF_MANAGE)
  @AuditLog("User")
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.tenantId!, dto);
  }

  @Patch(":id")
  @RequirePermissions(Permission.STAFF_MANAGE)
  @AuditLog("User")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.tenantId!, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(Permission.STAFF_MANAGE)
  @AuditLog("User")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.usersService.remove(user.tenantId!, id);
  }
}
