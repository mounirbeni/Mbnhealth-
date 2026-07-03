import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class DiagnosisInputDto {
  @IsOptional()
  @IsString()
  icdCode?: string;

  @IsString()
  description!: string;

  @IsOptional()
  isPrimary?: boolean;
}

export class CreateMedicalRecordDto {
  @IsString()
  patientId!: string;

  @IsString()
  doctorId!: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  subjective?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  assessment?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsString()
  voiceNoteUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisInputDto)
  diagnoses?: DiagnosisInputDto[];
}

export class UpdateMedicalRecordDto {
  @IsOptional()
  @IsString()
  subjective?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  assessment?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsString()
  voiceNoteUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisInputDto)
  diagnoses?: DiagnosisInputDto[];
}
