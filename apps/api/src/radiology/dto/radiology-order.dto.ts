import { IsOptional, IsString } from "class-validator";

export class CreateRadiologyOrderDto {
  @IsString()
  patientId!: string;

  @IsString()
  doctorId!: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsString()
  examType!: string;
}

export class CompleteRadiologyOrderDto {
  @IsOptional()
  @IsString()
  resultUrl?: string;

  @IsOptional()
  @IsString()
  findings?: string;
}
