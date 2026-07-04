import { IsOptional, IsString } from "class-validator";

export class SearchClinicsDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  specialty?: string;
}

export class AvailabilityQueryDto {
  @IsString()
  date!: string; // YYYY-MM-DD, interpreted in the clinic's own timezone
}
