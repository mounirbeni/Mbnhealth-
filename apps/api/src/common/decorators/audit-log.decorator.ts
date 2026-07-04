import { SetMetadata } from "@nestjs/common";

export const AUDIT_ENTITY_KEY = "audit_entity_type";
export const AUDIT_TENANT_PARAM_KEY = "audit_tenant_param";
export const AUDIT_TENANT_FROM_RESULT_KEY = "audit_tenant_from_result";

/** Marks a controller method as a security-relevant write; the global
 * AuditLogInterceptor records a CREATE/UPDATE/DELETE entry (inferred from
 * the HTTP method) tagged with this entity type after a successful response. */
export const AuditLog = (entityType: string) => SetMetadata(AUDIT_ENTITY_KEY, entityType);

/** For routes a Super Admin (no tenant of their own) uses to act on a
 * specific tenant, e.g. PATCH /tenants/:id/status — logs the entry under
 * the *affected* tenant (read from this route param) instead of being
 * silently dropped for lack of an actor tenantId. */
export const AuditTenantFromParam = (param: string) => SetMetadata(AUDIT_TENANT_PARAM_KEY, param);

/** For a Super Admin creating a brand-new tenant (POST /tenants) — there is
 * no route param to read yet, so attribute the entry to the tenant the
 * response itself just created (its `id` IS the tenant id). */
export const AuditTenantFromResult = () => SetMetadata(AUDIT_TENANT_FROM_RESULT_KEY, true);
