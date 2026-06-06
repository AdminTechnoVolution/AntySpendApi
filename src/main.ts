import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { mongoSanitizeMiddleware } from './shared/security/mongo-sanitize.middleware';
import { BEARER_AUTH_SCHEME } from './shared/swagger/swagger.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  app.use(mongoSanitizeMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('AntySpend API')
    .setDescription('Backend API for AntySpend Android app (offline-first sync)')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from POST /auth/google or POST /auth/refresh',
      },
      BEARER_AUTH_SCHEME,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/openapi.json', (_req: unknown, res: { json: (body: unknown) => void }) => {
    res.json(document);
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
