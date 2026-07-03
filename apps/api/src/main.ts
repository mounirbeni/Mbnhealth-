import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import compression from "compression";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: config.get<string>("corsOrigin"),
    credentials: true,
  });
  app.setGlobalPrefix("api/v1", { exclude: ["health"] });

  const port = config.get<number>("port")!;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`MBN Health API listening on port ${port}`);
}

bootstrap();
