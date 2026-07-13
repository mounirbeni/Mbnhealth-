import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { ListingInquiryStatus } from "@mbn/database";

export class UpdateInquiryStatusDto {
  @IsEnum(ListingInquiryStatus)
  status!: ListingInquiryStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}
