import { Module } from "@nestjs/common";
import { DoctorsService } from "./doctors.service";
import { DoctorsController } from "./doctors.controller";
import { PlanLimitsService } from "../common/plan-limits/plan-limits.service";

@Module({
  providers: [DoctorsService, PlanLimitsService],
  controllers: [DoctorsController],
  exports: [DoctorsService],
})
export class DoctorsModule {}
