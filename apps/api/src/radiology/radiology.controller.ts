import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { OrderStatus, Permission } from "@mbn/database";
import { RadiologyService } from "./radiology.service";
import { CompleteRadiologyOrderDto, CreateRadiologyOrderDto } from "./dto/radiology-order.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { AuditLog } from "../common/decorators/audit-log.decorator";

@Controller("radiology-orders")
@RequirePermissions(Permission.RADIOLOGY_READ)
export class RadiologyController {
  constructor(private readonly radiologyService: RadiologyService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("status") status?: OrderStatus,
    @Query("patientId") patientId?: string,
  ) {
    return this.radiologyService.findAll(user.tenantId!, { status, patientId });
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.radiologyService.findOne(user.tenantId!, id);
  }

  @Post()
  @RequirePermissions(Permission.RADIOLOGY_WRITE)
  @AuditLog("RadiologyOrder")
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRadiologyOrderDto) {
    return this.radiologyService.create(user.tenantId!, dto);
  }

  @Patch(":id/start")
  @RequirePermissions(Permission.RADIOLOGY_WRITE)
  @AuditLog("RadiologyOrder")
  start(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.radiologyService.start(user.tenantId!, id);
  }

  @Patch(":id/complete")
  @RequirePermissions(Permission.RADIOLOGY_WRITE)
  @AuditLog("RadiologyOrder")
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: CompleteRadiologyOrderDto,
  ) {
    return this.radiologyService.complete(user.tenantId!, id, dto);
  }

  @Patch(":id/cancel")
  @RequirePermissions(Permission.RADIOLOGY_WRITE)
  @AuditLog("RadiologyOrder")
  cancel(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.radiologyService.cancel(user.tenantId!, id);
  }
}
