import { Module } from "@nestjs/common";
import { RadiologyService } from "./radiology.service";
import { RadiologyController } from "./radiology.controller";

@Module({
  providers: [RadiologyService],
  controllers: [RadiologyController],
})
export class RadiologyModule {}
