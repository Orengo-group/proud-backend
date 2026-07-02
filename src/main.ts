import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // ─── CORS ───────────────────────────────────────────────────────────────────
  const corsOrigin = configService.get<string>('cors.origin', '*');
  app.enableCors({ origin: corsOrigin });

  // ─── Global validation pipe ──────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // strip unknown props
      forbidNonWhitelisted: true,
      transform: true,          // auto-transform payloads to DTO instances
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger / OpenAPI ───────────────────────────────────────────────────────
  if (configService.get<string>('nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Proud Backend API')
      .setDescription(
        'Backend API for the PROUD student engagement and incentive platform',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger UI available at /docs');
  }

  // ─── Start server ────────────────────────────────────────────────────────────
  const port = configService.get<number>('port', 3000);
  await app.listen(port);
  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
