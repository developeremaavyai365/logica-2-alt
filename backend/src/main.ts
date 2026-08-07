import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());

  // Never trust client input, even from our own frontend: strip unknown
  // properties and hard-reject requests that send fields the DTO doesn't
  // declare, rather than silently dropping them.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = config.getOrThrow<string>('CORS_ORIGINS').split(',').map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins, // explicit allow-list — never a wildcard
    credentials: true, // required for the httpOnly refresh cookie
  });

  const port = config.get<number>('PORT') ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Logica backend listening on :${port}`);
}

bootstrap();
