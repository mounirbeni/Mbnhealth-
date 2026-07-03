import { IsEmail, IsEnum, IsString, Matches, MinLength } from "class-validator";
import { SystemRoleName } from "@mbn/database";

export class RegisterTenantDto {
  @IsString()
  @MinLength(2)
  clinicName!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: "slug may only contain lowercase letters, numbers and hyphens",
  })
  slug!: string;

  @IsString()
  city!: string;

  @IsString()
  address!: string;

  @IsString()
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: "enter a valid mobile phone number",
  })
  phone!: string;

  @IsEmail()
  ownerEmail!: string;

  @IsString()
  ownerFirstName!: string;

  @IsString()
  ownerLastName!: string;

  @IsEnum(SystemRoleName, { message: "select a valid role" })
  ownerRole!: Exclude<SystemRoleName, "SUPER_ADMIN">;

  @IsString()
  @MinLength(8, { message: "password must be at least 8 characters" })
  password!: string;
}
