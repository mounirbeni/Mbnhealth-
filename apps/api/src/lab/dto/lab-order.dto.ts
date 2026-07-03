import { IsOptional, IsString } from "class-validator";

export class CreateLabOrderDto {
  @IsString()
  patientId!: string;

  @IsString()
  doctorId!: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsString()
  testName!: string;
}

export class CompleteLabOrderDto {
  @IsOptional()
  @IsString()
  resultUrl?: string;

  @IsOptional()
  @IsString()
  resultNotes?: string;
}
