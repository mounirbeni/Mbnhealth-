import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PatientAccessPayload } from "../types/authenticated-patient.interface";

/** Verifies the distinct "patient_access" JWT issued by PatientAuthService.
 * Applied per-route (alongside @Public() to skip the staff JwtAuthGuard),
 * since patients are a completely separate identity from staff users —
 * no roleId, no permissions, no tenant-wide access. */
@Injectable()
export class PatientAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) throw new UnauthorizedException("Missing access token");

    let payload: PatientAccessPayload;
    try {
      payload = this.jwt.verify(token, { secret: this.config.get<string>("jwt.accessSecret") });
    } catch {
      throw new UnauthorizedException("Invalid or expired access token");
    }
    if (payload.type !== "patient_access") throw new UnauthorizedException("Invalid access token");

    request.patient = {
      patientId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
    return true;
  }
}
