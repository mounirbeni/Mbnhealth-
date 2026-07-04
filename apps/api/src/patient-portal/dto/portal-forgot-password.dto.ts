import { IsEmail } from "class-validator";

export class PortalForgotPasswordDto {
  @IsEmail()
  email!: string;
}
