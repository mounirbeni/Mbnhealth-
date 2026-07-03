import { IsOptional, IsString } from "class-validator";

export class RequestUploadUrlDto {
  @IsString()
  fileName!: string;

  @IsString()
  contentType!: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class ConfirmUploadDto {
  @IsString()
  key!: string;

  @IsString()
  fileName!: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
