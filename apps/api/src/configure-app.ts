import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import compression from "compression";

/** Shared between the persistent server entry point (main.ts, used by
 * Docker/local dev) and the Vercel serverless handler (api/index.ts), so
 * both expose the exact same middleware/prefix/CORS setup. */
export function configureApp(app: INestApplication): ConfigService {
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: config.get<string>("corsOrigin"),
    credentials: true,
  });
  app.setGlobalPrefix("api/v1", { exclude: ["health"] });

  return config;
}
