import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import compression from "compression";

/** Middleware/CORS/prefix setup shared by main.ts, kept separate so it's
 * easy to reuse from a second entry point later without duplicating it. */
export function configureApp(app: INestApplication): ConfigService {
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: config.get<string[]>("corsOrigin"),
    credentials: true,
  });
  app.setGlobalPrefix("api/v1", { exclude: ["health", "/"] });

  return config;
}
