import { IsString } from "class-validator";

export class PortalRefreshTokenDto {
  @IsString()
  refreshToken!: string;
}
