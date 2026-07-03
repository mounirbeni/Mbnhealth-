import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "@mbn/database";
import { PermissionsGuard } from "./permissions.guard";

function buildContext(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("PermissionsGuard", () => {
  it("allows access when no permissions are required", () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(buildContext({ permissions: [] }))).toBe(true);
  });

  it("allows access when the user has all required permissions", () => {
    const reflector = {
      getAllAndOverride: () => [Permission.PATIENTS_READ],
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    const ctx = buildContext({ permissions: [Permission.PATIENTS_READ, Permission.PATIENTS_WRITE] });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("throws ForbiddenException when a required permission is missing", () => {
    const reflector = {
      getAllAndOverride: () => [Permission.BILLING_WRITE],
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    const ctx = buildContext({ permissions: [Permission.PATIENTS_READ] });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("throws ForbiddenException when there is no authenticated user", () => {
    const reflector = {
      getAllAndOverride: () => [Permission.PATIENTS_READ],
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    expect(() => guard.canActivate(buildContext(undefined))).toThrow(ForbiddenException);
  });
});
