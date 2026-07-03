import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp } from "./configure-app";

/**
 * Entry point for every deployment target, including Vercel: its "nestjs"
 * framework preset detects this exact app.listen() pattern and wraps it
 * into a serverless function automatically (confirmed against a live
 * deployment) — no custom serverless handler needed. What Vercel's
 * per-invocation model does NOT provide is a persistent background
 * process, which is why there's no BullMQ/@nestjs/schedule here; see
 * src/reminders and src/whatsapp/whatsapp-inbound.service.ts instead.
 */
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
