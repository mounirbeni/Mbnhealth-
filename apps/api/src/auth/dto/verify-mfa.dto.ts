import { IsString, Length } from "class-validator";

export class VerifyMfaDto {
  @IsString()
  challengeToken!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}

export class ConfirmMfaSetupDto {
  @IsString()
  @Length(6, 6)
  code!: string;
}
