import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { MedicalRecordsService } from "./medical-records.service";
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from "./dto/medical-record.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("medical-records")
@RequirePermissions(Permission.MEDICAL_RECORDS_READ)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get()
  findAllForPatient(@CurrentUser() user: AuthenticatedUser, @Query("patientId") patientId: string) {
    return this.medicalRecordsService.findAllForPatient(user.tenantId!, patientId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.medicalRecordsService.findOne(user.tenantId!, id);
  }

  @Post()
  @RequirePermissions(Permission.MEDICAL_RECORDS_WRITE)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(user.tenantId!, dto);
  }

  @Patch(":id")
  @RequirePermissions(Permission.MEDICAL_RECORDS_WRITE)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(user.tenantId!, id, dto);
  }

  @Patch(":id/finalize")
  @RequirePermissions(Permission.MEDICAL_RECORDS_WRITE)
  finalize(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.medicalRecordsService.finalize(user.tenantId!, id);
  }

  @Patch(":id/amend")
  @RequirePermissions(Permission.MEDICAL_RECORDS_WRITE)
  amend(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.amend(user.tenantId!, id, dto);
  }
}
