import { Body, Controller, Delete, Get, HttpCode, Param, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterTenantDto } from "./dto/register-tenant.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { VerifyMfaDto, ConfirmMfaSetupDto } from "./dto/verify-mfa.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RegenerateRecoveryCodesDto } from "./dto/regenerate-recovery-codes.dto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ReqMeta, RequestMeta } from "../common/decorators/request-meta.decorator";
import { AuthenticatedUser } from "./types/authenticated-user.interface";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register-tenant")
  registerTenant(@Body() dto: RegisterTenantDto, @ReqMeta() meta: RequestMeta) {
    return this.authService.registerTenant(dto, meta);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("login")
  login(@Body() dto: LoginDto, @ReqMeta() meta: RequestMeta) {
    return this.authService.login(dto, meta);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("mfa/verify")
  verifyMfa(@Body() dto: VerifyMfaDto, @ReqMeta() meta: RequestMeta) {
    return this.authService.verifyMfaAndLogin(dto.challengeToken, dto.code, meta);
  }

  @Public()
  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto, @ReqMeta() meta: RequestMeta) {
    return this.authService.refresh(dto.refreshToken, meta);
  }

  @HttpCode(200)
  @Post("logout")
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.userId);
  }

  @Post("mfa/setup")
  startMfaSetup(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.startMfaSetup(user.userId);
  }

  @Post("mfa/confirm")
  confirmMfaSetup(@CurrentUser() user: AuthenticatedUser, @Body() dto: ConfirmMfaSetupDto) {
    return this.authService.confirmMfaSetup(user.userId, dto.code);
  }

  @Post("mfa/disable")
  disableMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.disableMfa(user.userId);
  }

  @Post("mfa/recovery-codes/regenerate")
  regenerateRecoveryCodes(@CurrentUser() user: AuthenticatedUser, @Body() dto: RegenerateRecoveryCodesDto) {
    return this.authService.regenerateRecoveryCodes(user.userId, dto.currentPassword);
  }

  @Post("change-password")
  @HttpCode(200)
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto, @ReqMeta() meta: RequestMeta) {
    return this.authService.changePassword(user.userId, dto.currentPassword, dto.newPassword, meta);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("forgot-password")
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto, @ReqMeta() meta: RequestMeta) {
    return this.authService.forgotPassword(dto.email, meta);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("reset-password")
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto, @ReqMeta() meta: RequestMeta) {
    return this.authService.resetPassword(dto.token, dto.newPassword, meta);
  }

  @Get("sessions")
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.listSessions(user.userId);
  }

  @Delete("sessions/:id")
  revokeSession(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.authService.revokeSession(user.userId, id);
  }
}
