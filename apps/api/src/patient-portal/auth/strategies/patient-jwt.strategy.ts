import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthenticatedPatient, PatientJwtPayload } from "../types/authenticated-patient.interface";

@Injectable()
export class PatientJwtStrategy extends PassportStrategy(Strategy, "patient-jwt") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("jwt.patientSecret")!,
    });
  }

  async validate(payload: PatientJwtPayload): Promise<AuthenticatedPatient> {
    if (payload.type !== "patient_access") throw new UnauthorizedException("Invalid patient session");
    return {
      patientAccountId: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}
