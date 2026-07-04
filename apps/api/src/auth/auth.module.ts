import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { TokensService } from "./services/tokens.service";
import { MfaService } from "./services/mfa.service";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { TenantsModule } from "../tenants/tenants.module";

@Module({
  imports: [
    PassportModule,
    AuditLogModule,
    TenantsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("jwt.accessSecret"),
        signOptions: { expiresIn: config.get<string>("jwt.accessTtl") },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokensService, MfaService],
  exports: [AuthService, TokensService],
})
export class AuthModule {}
