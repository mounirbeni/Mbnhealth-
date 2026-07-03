import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { PrescriptionsService } from "./prescriptions.service";
import { CreatePrescriptionDto } from "./dto/prescription.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("prescriptions")
@RequirePermissions(Permission.PRESCRIPTIONS_READ)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get()
  findAllForPatient(@CurrentUser() user: AuthenticatedUser, @Query("patientId") patientId: string) {
    return this.prescriptionsService.findAllForPatient(user.tenantId!, patientId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.prescriptionsService.findOne(user.tenantId!, id);
  }

  @Post()
  @RequirePermissions(Permission.PRESCRIPTIONS_WRITE)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(user.tenantId!, dto);
  }

  @Patch(":id/cancel")
  @RequirePermissions(Permission.PRESCRIPTIONS_WRITE)
  cancel(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.prescriptionsService.cancel(user.tenantId!, id);
  }

  @Patch(":id/complete")
  @RequirePermissions(Permission.PRESCRIPTIONS_WRITE)
  complete(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.prescriptionsService.complete(user.tenantId!, id);
  }
}
