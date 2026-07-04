import { IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";
import { SubscriptionPlan } from "@mbn/database";

export class AdminUpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  website?: string;

  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;
}
