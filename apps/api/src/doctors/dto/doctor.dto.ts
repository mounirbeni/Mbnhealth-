import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateDoctorDto {
  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  consultationFee?: number;

  @IsOptional()
  workingHours?: Record<string, [string, string]>;
}

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  consultationFee?: number;

  @IsOptional()
  workingHours?: Record<string, [string, string]>;
}
