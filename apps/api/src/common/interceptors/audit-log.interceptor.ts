import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditAction } from "@mbn/database";
import { AuditLogService } from "../../audit-log/audit-log.service";
import { AUDIT_ENTITY_KEY } from "../decorators/audit-log.decorator";
import { AuthenticatedUser } from "../../auth/types/authenticated-user.interface";

const METHOD_ACTION: Partial<Record<string, AuditAction>> = {
  POST: AuditAction.CREATE,
  PATCH: AuditAction.UPDATE,
  PUT: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

/** Records a CREATE/UPDATE/DELETE audit entry for any route tagged with
 * @AuditLog(entityType), after it responds successfully. Auth events
 * (login/logout/register) are logged explicitly in AuthService instead,
 * since they need detail (failed attempts, etc.) this generic interceptor
 * doesn't have. */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLog: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const entityType = this.reflector.getAllAndOverride<string | undefined>(AUDIT_ENTITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!entityType) return next.handle();

    const request = context.switchToHttp().getRequest();
    const action = METHOD_ACTION[request.method as string];
    if (!action) return next.handle();

    const user: AuthenticatedUser | undefined = request.user;
    if (!user?.tenantId) return next.handle();

    return next.handle().pipe(
      tap((result) => {
        const entityId =
          (result && typeof result === "object" && "id" in (result as Record<string, unknown>)
            ? (result as Record<string, unknown>).id
            : undefined) ??
          request.params?.id ??
          null;

        this.auditLog
          .record({
            tenantId: user.tenantId,
            userId: user.userId,
            action,
            entityType,
            entityId: entityId as string | null,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"],
          })
          .catch(() => undefined);
      }),
    );
  }
}
