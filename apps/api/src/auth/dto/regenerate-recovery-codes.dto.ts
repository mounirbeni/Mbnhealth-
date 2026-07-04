import { IsString } from "class-validator";

export class RegenerateRecoveryCodesDto {
  @IsString()
  currentPassword!: string;
}
