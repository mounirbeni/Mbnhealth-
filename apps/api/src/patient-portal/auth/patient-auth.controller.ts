import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../../common/decorators/public.decorator";
import { PatientAuthService } from "./patient-auth.service";
import {
  LoginPatientDto,
  RegisterPatientDto,
  ForgotPatientPasswordDto,
  ResetPatientPasswordDto,
} from "./dto/patient-auth.dto";
import { PatientJwtAuthGuard } from "./guards/patient-jwt-auth.guard";
import { CurrentPatient } from "./decorators/current-patient.decorator";
import { AuthenticatedPatient } from "./types/authenticated-patient.interface";

@Controller("public/patient-auth")
export class PatientAuthController {
  constructor(private readonly patientAuth: PatientAuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("register")
  register(@Body() dto: RegisterPatientDto) {
    return this.patientAuth.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("login")
  login(@Body() dto: LoginPatientDto) {
    return this.patientAuth.login(dto);
  }

  @Public()
  @UseGuards(PatientJwtAuthGuard)
  @Get("me")
  me(@CurrentPatient() patient: AuthenticatedPatient) {
    return this.patientAuth.me(patient.patientAccountId);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPatientPasswordDto) {
    return this.patientAuth.forgotPassword(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("reset-password")
  resetPassword(@Body() dto: ResetPatientPasswordDto) {
    return this.patientAuth.resetPassword(dto.token, dto.newPassword);
  }
}
