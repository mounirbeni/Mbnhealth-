import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { DoctorsService } from "./doctors.service";
import { CreateDoctorDto, UpdateDoctorDto } from "./dto/doctor.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { AuditLog } from "../common/decorators/audit-log.decorator";

@Controller("doctors")
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @RequirePermissions(Permission.DOCTORS_READ)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("departmentId") departmentId?: string,
    @Query("search") search?: string,
  ) {
    return this.doctorsService.findAll(user.tenantId!, { departmentId, search });
  }

  @Get(":id")
  @RequirePermissions(Permission.DOCTORS_READ)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.doctorsService.findOne(user.tenantId!, id);
  }

  @Get(":id/availability")
  @RequirePermissions(Permission.DOCTORS_READ)
  availability(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.doctorsService.availability(user.tenantId!, id, new Date(from), new Date(to));
  }

  @Post()
  @RequirePermissions(Permission.DOCTORS_WRITE)
  @AuditLog("Doctor")
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(user.tenantId!, dto);
  }

  @Patch(":id")
  @RequirePermissions(Permission.DOCTORS_WRITE)
  @AuditLog("Doctor")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: UpdateDoctorDto) {
    return this.doctorsService.update(user.tenantId!, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(Permission.DOCTORS_WRITE)
  @AuditLog("Doctor")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.doctorsService.remove(user.tenantId!, id);
  }
}
