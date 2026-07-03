import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { PatientsService } from "./patients.service";
import {
  AddAllergyDto,
  AddMedicationDto,
  AddVitalDto,
  CreatePatientDto,
  UpdatePatientDto,
} from "./dto/patient.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("patients")
@RequirePermissions(Permission.PATIENTS_READ)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("search") search?: string,
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "25",
  ) {
    return this.patientsService.findAll(user.tenantId!, { search, page: +page, pageSize: +pageSize });
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.patientsService.findOne(user.tenantId!, id);
  }

  @Get(":id/timeline")
  timeline(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.patientsService.timeline(user.tenantId!, id);
  }

  @Post()
  @RequirePermissions(Permission.PATIENTS_WRITE)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(user.tenantId!, dto);
  }

  @Patch(":id")
  @RequirePermissions(Permission.PATIENTS_WRITE)
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(user.tenantId!, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(Permission.PATIENTS_DELETE)
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.patientsService.remove(user.tenantId!, id);
  }

  @Post(":id/allergies")
  @RequirePermissions(Permission.PATIENTS_WRITE)
  addAllergy(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: AddAllergyDto) {
    return this.patientsService.addAllergy(user.tenantId!, id, dto);
  }

  @Delete(":id/allergies/:allergyId")
  @RequirePermissions(Permission.PATIENTS_WRITE)
  removeAllergy(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("allergyId") allergyId: string,
  ) {
    return this.patientsService.removeAllergy(user.tenantId!, id, allergyId);
  }

  @Post(":id/medications")
  @RequirePermissions(Permission.PATIENTS_WRITE)
  addMedication(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AddMedicationDto,
  ) {
    return this.patientsService.addMedication(user.tenantId!, id, dto);
  }

  @Patch(":id/medications/:medicationId/stop")
  @RequirePermissions(Permission.PATIENTS_WRITE)
  stopMedication(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("medicationId") medicationId: string,
  ) {
    return this.patientsService.stopMedication(user.tenantId!, id, medicationId);
  }

  @Post(":id/vitals")
  @RequirePermissions(Permission.PATIENTS_WRITE)
  addVital(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: AddVitalDto) {
    return this.patientsService.addVital(user.tenantId!, id, dto, user.userId);
  }
}
