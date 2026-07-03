import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JwtAccessPayload, AuthenticatedUser } from "../types/authenticated-user.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("jwt.accessSecret")!,
    });
  }

  async validate(payload: JwtAccessPayload): Promise<AuthenticatedUser> {
    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      roleId: payload.roleId,
      roleName: payload.roleName,
      systemRole: payload.systemRole,
      permissions: payload.permissions,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}
