import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterPatientDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginPatientDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
