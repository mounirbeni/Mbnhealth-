import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class RegisterTenantDto {
  @IsString()
  @MinLength(2)
  clinicName!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: "slug may only contain lowercase letters, numbers and hyphens",
  })
  slug!: string;

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
