import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PatientAuthController } from "./patient-auth.controller";
import { PatientAuthService } from "./patient-auth.service";
import { PatientPortalController } from "./patient-portal.controller";
import { PatientPortalService } from "./patient-portal.service";
import { PatientAuthGuard } from "./guards/patient-auth.guard";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("jwt.accessSecret"),
      }),
    }),
  ],
  controllers: [PatientAuthController, PatientPortalController],
  providers: [PatientAuthService, PatientPortalService, PatientAuthGuard],
})
export class PatientPortalModule {}
