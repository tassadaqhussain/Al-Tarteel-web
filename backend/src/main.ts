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
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || ['http://localhost:3000'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Al-Tarteel Quran API')
    .setDescription('REST API for Quran content, audio, translations, and user features')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);
  console.log(`Al-Tarteel API running at http://localhost:${port}/${prefix}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
