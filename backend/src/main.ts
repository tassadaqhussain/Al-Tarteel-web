import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(prefix);
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
