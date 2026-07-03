import { Permission } from "@mbn/database";

export interface AuthenticatedUser {
  userId: string;
  tenantId: string | null;
  roleId: string;
  roleName: string;
  systemRole: string | null;
  permissions: Permission[];
  email: string;
  firstName: string;
  lastName: string;
}

export interface JwtAccessPayload {
  sub: string;
  tenantId: string | null;
  roleId: string;
  roleName: string;
  systemRole: string | null;
  permissions: Permission[];
  email: string;
  firstName: string;
  lastName: string;
  type: "access";
}
