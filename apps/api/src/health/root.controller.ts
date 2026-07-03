import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";

/** Friendly response for anyone hitting the bare API domain directly
 * (browser, health-checking tool, curiosity) instead of NestJS's default
 * "Cannot GET /" 404 — the real UI lives on the separate apps/web
 * deployment, not here. */
@Controller()
export class RootController {
  @Public()
  @Get()
  index() {
    return {
      name: "MBN Health API",
      status: "ok",
      docs: "See /health for a liveness check and /api/v1/* for the REST API.",
    };
  }
}
