import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppointmentsModule } from "../appointments/appointments.module";
import { ClinicDirectoryController } from "./directory/clinic-directory.controller";
import { ClinicDirectoryService } from "./directory/clinic-directory.service";
import { ClinicListingsController } from "./listings/clinic-listings.controller";
import { ClinicListingsService } from "./listings/clinic-listings.service";
import { PatientAuthController } from "./auth/patient-auth.controller";
import { PatientAuthService } from "./auth/patient-auth.service";
import { PatientJwtStrategy } from "./auth/strategies/patient-jwt.strategy";
import { PatientBookingsController } from "./bookings/patient-bookings.controller";
import { PatientBookingsService } from "./bookings/patient-bookings.service";
import { PlanLimitsService } from "../common/plan-limits/plan-limits.service";

@Module({
  imports: [
    AppointmentsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("jwt.patientSecret"),
        signOptions: { expiresIn: config.get<string>("jwt.patientTtl") },
      }),
    }),
  ],
  controllers: [ClinicDirectoryController, ClinicListingsController, PatientAuthController, Patie