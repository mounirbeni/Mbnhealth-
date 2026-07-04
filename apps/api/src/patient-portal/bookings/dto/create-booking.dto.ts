import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateBookingDto {
  @IsString()
  tenantSlug!: string;

  @IsString()
  doctorId!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  // Only required the first time this patient books with a given clinic
  // (i.e. when there's no PatientAccountLink yet and a new Patient record
  // must be created for that tenant).
  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
