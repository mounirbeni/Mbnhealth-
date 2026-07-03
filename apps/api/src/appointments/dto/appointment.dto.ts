import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { AppointmentStatus, AppointmentType } from "@mbn/database";

export class CreateAppointmentDto {
  @IsString()
  patientId!: string;

  @IsString()
  doctorId!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;
}

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}

export class CreateWaitlistEntryDto {
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
