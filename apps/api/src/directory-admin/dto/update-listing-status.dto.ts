import { IsEnum } from "class-validator";
import { ClinicListingStatus } from "@mbn/database";

export class UpdateListingStatusDto {
  @IsEnum(ClinicListingStatus)
  status!: ClinicListingStatus;
}
