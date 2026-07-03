import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class UpsertWhatsAppConfigDto {
  @IsString()
  @MinLength(3)
  phoneNumberId!: string;

  @IsOptional()
  @IsString()
  businessAccountId?: string;

  @IsOptional()
  @IsString()
  displayPhoneNumber?: string;

  @IsString()
  @MinLength(10)
  accessToken!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  aiBotEnabled?: boolean;
}

export class SendWhatsAppMessageDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsString()
  to!: string;

  @IsString()
  message!: string;
}
