import { SetMetadata } from "@nestjs/common";
import { Permission } from "@mbn/database";

export const PERMISSIONS_KEY = "permissions";

/** Requires the authenticated user's role to include ALL listed permissions. */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
