import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

export const ReqMeta = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestMeta => {
  const request = ctx.switchToHttp().getRequest();
  return {
    ipAddress: request.ip,
    userAgent: request.headers["user-agent"],
  };
});
