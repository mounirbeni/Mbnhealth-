import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import compression from "compression";

/** Middleware/CORS/prefix setup shared by main.ts, kept separate so it's
 * easy to reuse from a second entry point later without duplicating it. */
export function configureApp(app: INestApplication): ConfigService {
  const config = app.get(ConfigService);

  // Vercel puts every request through its edge network before it reaches
  // this serverless function, so without this Express sees Vercel's proxy
  // address as req.ip for every single request — collapsing all visitors
  // into one shared rate-limit bucket (ThrottlerGuard trackers by IP) and
  // making "Too Many Requests" trip almost immediately under real traffic.
  // Trusting the first hop makes req.ip resolve from X-Forwarded-For.
  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: config.get<string>("corsOrigin"),
    credentials: true,
  });
  app.setGlobalPrefix("api/v1", { exclude: ["health", "/"] });

  return config;
}
