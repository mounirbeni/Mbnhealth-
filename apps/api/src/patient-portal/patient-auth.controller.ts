import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { PatientAuthService } from "./patient-auth.service";
import { ActivatePortalDto } from "./dto/activate-portal.dto";
import { PortalLoginDto } from "./dto/portal-login.dto";
import { PortalRefreshTokenDto } from "./dto/portal-refresh-token.dto";
import { PortalForgotPasswordDto } from "./dto/portal-forgot-password.dto";
import { PortalResetPasswordDto } from "./dto/portal-reset-password.dto";
import { Public } from "../common/decorators/public.decorator";
import { ReqMeta, RequestMeta } from "../common/decorators/request-meta.decorator";
import { PatientAuthGuard } from "./guards/patient-auth.guard";
import { CurrentPatient } from "./decorators/current-patient.decorator";

@Controller("portal/auth")
export class PatientAuthController {
  constructor(private readonly patientAuthService: PatientAuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("activate")
  activate(@Body() dto: ActivatePortalDto, @ReqMeta() meta: RequestMeta) {
    return this.patientAuthService.activate(dto, meta);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("login")
  login(@Body() dto: PortalLoginDto, @ReqMeta() meta: RequestMeta) {
    return this.patientAuthService.login(dto.email, dto.password, meta);
  }

  @Public()
  @Post("refresh")
  refresh(@Body() dto: PortalRefreshTokenDto, @ReqMeta() meta: RequestMeta) {
    return this.patientAuthService.refresh(dto.refreshToken, meta);
  }

  @Public()
  @HttpCode(200)
  @Post("logout")
  logout(@Body() dto: PortalRefreshTokenDto) {
    return this.patientAuthService.logout(dto.refreshToken);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  @Post("forgot-password")
  forgotPassword(@Body() dto: PortalForgotPasswordDto) {
    return this.patientAuthService.forgotPassword(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(200)
  @Post("reset-password")
  resetPassword(@Body() dto: PortalResetPasswordDto) {
    return this.patientAuthService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @UseGuards(PatientAuthGuard)
  @Get("me")
  me(@CurrentPatient("patientId") patientId: string) {
    return this.patientAuthService.me(patientId);
  }
}
