import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "@mbn/database";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { AuthenticatedUser } from "../../auth/types/authenticated-user.interface";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;
    if (!user) throw new ForbiddenException("Not authenticated");

    const hasAll = required.every((p) => user.permissions.includes(p));
    if (!hasAll) {
      throw new ForbiddenException(
        `Missing required permission(s): ${required.filter((p) => !user.permissions.includes(p)).join(", ")}`,
      );
    }
    return true;
  }
}
