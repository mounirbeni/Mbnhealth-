import { Module } from "@nestjs/common";
import { PatientsService } from "./patients.service";
import { PatientsController } from "./patients.controller";
import { PlanLimitsService } from "../common/plan-limits/plan-limits.service";

@Module({
  providers: [PatientsService, PlanLimitsService],
  controllers: [PatientsController],
  exports: [PatientsService],
})
export class PatientsModule {}
