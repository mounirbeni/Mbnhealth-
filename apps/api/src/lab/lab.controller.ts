import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { OrderStatus, Permission } from "@mbn/database";
import { LabService } from "./lab.service";
import { CompleteLabOrderDto, CreateLabOrderDto } from "./dto/lab-order.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("lab-orders")
@RequirePermissions(Permission.LAB_READ)
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("status") status?: OrderStatus,
    @Query("patientId") patientId?: string,
  ) {
    return this.labService.findAll(user.tenantId!, { status, patientId });
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.labService.findOne(user.tenantId!, id);
  }

  @Post()
  @RequirePermissions(Permission.LAB_WRITE)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateLabOrderDto) {
    return this.labService.create(user.tenantId!, dto);
  }

  @Patch(":id/start")
  @RequirePermissions(Permission.LAB_WRITE)
  start(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.labService.start(user.tenantId!, id);
  }

  @Patch(":id/complete")
  @RequirePermissions(Permission.LAB_WRITE)
  complete(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: CompleteLabOrderDto) {
    return this.labService.complete(user.tenantId!, id, dto);
  }

  @Patch(":id/cancel")
  @RequirePermissions(Permission.LAB_WRITE)
  cancel(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.labService.cancel(user.tenantId!, id);
  }
}
