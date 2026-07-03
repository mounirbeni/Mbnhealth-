import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Gender } from "@mbn/database";

export class CreatePatientDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsDateString()
  dob!: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}

export class AddAllergyDto {
  @IsString()
  substance!: string;

  @IsOptional()
  @IsString()
  reaction?: string;

  @IsOptional()
  @IsString()
  severity?: "MILD" | "MODERATE" | "SEVERE";
}

export class AddMedicationDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  frequency?: string;
}

export class AddVitalDto {
  @IsOptional()
  temperatureC?: number;

  @IsOptional()
  bloodPressureSystolic?: number;

  @IsOptional()
  bloodPressureDiastolic?: number;

  @IsOptional()
  heartRate?: number;

  @IsOptional()
  respiratoryRate?: number;

  @IsOptional()
  oxygenSaturation?: number;

  @IsOptional()
  weightKg?: number;

  @IsOptional()
  heightCm?: number;
}
