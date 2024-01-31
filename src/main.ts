import "dotenv/config"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    credentials: true,
    origin: process.env.NODE_ENV === 'production' ? process.env.PROD_CLIENT_HOSTNAME : process.env.DEV_CLIENT_HOSTNAME,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  await app.listen(process.env.REST_API_PORT);
}

bootstrap();