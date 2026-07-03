import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Permission, AppointmentStatus } from "@mbn/database";
import { AppointmentsService } from "./appointments.service";
import {
  CreateAppointmentDto,
  CreateWaitlistEntryDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
} from "./dto/appointment.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("appointments")
@RequirePermissions(Permission.APPOINTMENTS_READ)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("doctorId") doctorId?: string,
    @Query("patientId") patientId?: string,
    @Query("status") status?: AppointmentStatus,
  ) {
    return this.appointmentsService.findAll(user.tenantId!, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      doctorId,
      patientId,
      status,
    });
  }

  @Get("waitlist")
  listWaitlist(@CurrentUser() user: AuthenticatedUser) {
    return this.appointmentsService.listWaitlist(user.tenantId!);
  }

  @Post("waitlist")
  @RequirePermissions(Permission.APPOINTMENTS_WRITE)
  addToWaitlist(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateWaitlistEntryDto) {
    return this.appointmentsService.addToWaitlist(user.tenantId!, dto);
  }

  @Delete("waitlist/:id")
  @RequirePermissions(Permission.APPOINTMENTS_WRITE)
  removeFromWaitlist(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.appointmentsService.removeFromWaitlist(user.tenantId!, id);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.appointmentsService.findOne(user.tenantId!, id);
  }

  @Post()
  @RequirePermissions(Permission.APPOINTMENTS_WRITE)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(user.tenantId!, dto, user.userId);
  }

  @Patch(":id")
  @RequirePermissions(Permission.APPOINTMENTS_WRITE)
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(user.tenantId!, id, dto);
  }

  @Patch(":id/status")
  @RequirePermissions(Permission.APPOINTMENTS_WRITE)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(user.tenantId!, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(Permission.APPOINTMENTS_DELETE)
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.appointmentsService.remove(user.tenantId!, id);
  }
}
