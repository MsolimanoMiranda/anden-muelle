import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? "3041";
  await app.listen(port);
  console.log(`muelle escuchando en :${port}`);
}

void bootstrap();
