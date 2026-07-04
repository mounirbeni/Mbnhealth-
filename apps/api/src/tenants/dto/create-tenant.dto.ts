import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, Matches, MinLength } from "class-validator";
import { SubscriptionPlan } from "@mbn/database";

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{8,15}$/, { message: "enter a valid mobile phone number" })
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: "enter a valid website URL, e.g. https://example.com" })
  website?: string;

  @IsEnum(SubscriptionPlan, { message: "select a valid plan" })
  plan!: SubscriptionPlan;

  @IsEmail()
  ownerEmail!: string;

  @IsString()
  ownerFirstName!: string;

  @IsString()
  ownerLastName!: string;

  @IsString()
  @MinLength(8, { message: "password must be at least 8 characters" })
  password!: string;
}
