import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { AppModule } from './app.module';
import { LOCAL_UPLOADS_DIR, photoStorageMode } from './modules/products/photo-storage.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());

  // Product photos uploaded in local development. Shown by the website from
  // another address, so they are marked loadable across sites (helmet's
  // default would block them). In production photos live in a bucket.
  if (photoStorageMode(config) === 'local') {
    app.useStaticAssets(LOCAL_UPLOADS_DIR, {
      prefix: '/uploads/',
      index: false,
      dotfiles: 'deny',
      setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
    });
  }
  // Gzip responses: the product catalogue the site loads on a first visit
  // is ~400 kB of JSON, ~10x smaller compressed.
  app.use(compression());
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
