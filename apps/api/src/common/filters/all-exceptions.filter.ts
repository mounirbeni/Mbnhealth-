import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { captureException } from "../monitoring/sentry";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttp ? exception.getResponse() : null;

    const message = isHttp
      ? typeof body === "string"
        ? body
        : (body as { message?: string | string[] })?.message ?? exception.message
      : "Internal server error";

    if (!isHttp) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
      captureException(exception);
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
      ...(isHttp && typeof body === "object" ? { error: (body as { error?: string }).error } : {}),
    });
  }
}
