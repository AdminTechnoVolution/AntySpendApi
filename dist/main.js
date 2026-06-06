"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./shared/filters/all-exceptions.filter");
const mongo_sanitize_middleware_1 = require("./shared/security/mongo-sanitize.middleware");
const swagger_constants_1 = require("./shared/swagger/swagger.constants");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);
    app.use(mongo_sanitize_middleware_1.mongoSanitizeMiddleware);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('AntySpend API')
        .setDescription('Backend API for AntySpend Android app (offline-first sync)')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from POST /auth/google or POST /auth/refresh',
    }, swagger_constants_1.BEARER_AUTH_SCHEME)
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        jsonDocumentUrl: 'docs-json',
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/openapi.json', (_req, res) => {
        res.json(document);
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map