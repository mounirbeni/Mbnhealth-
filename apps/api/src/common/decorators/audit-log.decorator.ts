import { SetMetadata } from "@nestjs/common";

export const AUDIT_ENTITY_KEY = "audit_entity_type";

/** Marks a controller method as a security-relevant write; the global
 * AuditLogInterceptor records a CREATE/UPDATE/DELETE entry (inferred from
 * the HTTP method) tagged with this entity type after a successful response. */
export const AuditLog = (entityType: string) => SetMetadata(AUDIT_ENTITY_KEY, entityType);
