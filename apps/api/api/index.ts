import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import type { Request, Response } from "express";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/configure-app";

/**
 * Vercel serverless function entry point. Unlike src/main.ts (which calls
 * app.listen() and blocks forever — fine for Docker/a VM, fatal on Vercel,
 * whose runtime invokes a request handler and expects it to return), this
 * builds the Nest app once per warm serverless instance and reuses it
 * across invocations, delegating each request to the underlying Express
 * app as a plain (req, res) handler.
 */
let cachedServer: express.Express | undefined;

async function bootstrapServer(): Promise<express.Express> {
  const expressInstance = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance), {
    cors: false,
    rawBody: true,
  });
  configureApp(app);
  await app.init();
  return expressInstance;
}

export default async function handler(req: Request, res: Response) {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  cachedServer(req, res);
}
