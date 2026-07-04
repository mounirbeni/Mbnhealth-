import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PlanLimitsService } from "../common/plan-limits/plan-limits.service";

@Module({
  providers: [UsersService, PlanLimitsService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
