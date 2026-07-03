import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp } from "./configure-app";

/** Persistent-server entry point: used by Docker/local dev/CI, anywhere
 * that isn't Vercel's serverless runtime. See api/index.ts for that. */
async function bootstrap() {
  // rawBody: true exposes req.rawBody, needed to verify the
  // X-Hub-Signature-256 header on incoming WhatsApp webhook payloads.
  const app = await NestFactory.create(AppModule, { cors: false, rawBody: true });
  const config = configureApp(app);

  const port = config.get<number>("port")!;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`MBN Health API listening on port ${port}`);
}

bootstrap();
