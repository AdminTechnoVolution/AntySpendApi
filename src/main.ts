import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { JwtAuthGuard } from './shared/auth/jwt-auth.guard';
import { mongoSanitizeMiddleware } from './shared/security/mongo-sanitize.middleware';
import { BEARER_AUTH_SCHEME } from './shared/swagger/swagger.constants';

/** Base64 receipt JSON can exceed Express default 100kb (see AiService MAX_RECEIPT_IMAGE_BYTES). */
const JSON_BODY_LIMIT = '8mb';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser('json', { limit: JSON_BODY_LIMIT });
  app.useBodyParser('urlencoded', { limit: JSON_BODY_LIMIT, extended: true });

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
  app.useGlobalGuards(app.get(JwtAuthGuard));
  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get(ConfigService);

  if (configService.get<boolean>('enableSwagger')) {
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
  }

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
  console.log(`AntySpend API listening on port ${port}`);
}

bootstrap().catch((error: unknown) => {
  console.error('AntySpend API failed to start:', error);
  process.exit(1);
});
