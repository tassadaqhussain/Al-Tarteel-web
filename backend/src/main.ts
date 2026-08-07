import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody required for Stripe webhook signature verification
  const app = await NestFactory.create(AppModule, { rawBody: true });
  // Respect X-Forwarded-For from Nginx (needed for production AI prompt limits).
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance()?.set?.('trust proxy', 1);
  const prefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(prefix);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const configuredOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) || [];
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      const isLocalDev = !!origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      const isConfigured = !!origin && configuredOrigins.includes(origin);
      callback(null, !origin || isLocalDev || isConfigured);
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('QuranPilot API')
    .setDescription('REST API for Quran content, audio, translations, and user features')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('qp_access')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);
  console.log(`QuranPilot API running at http://localhost:${port}/${prefix}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
