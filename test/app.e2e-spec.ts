import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AntySpend API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.MONGODB_URI =
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017/antyspend-test';
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ?? 'test-secret-min-16-chars';
    process.env.GOOGLE_CLIENT_ID =
      process.env.GOOGLE_CLIENT_ID ?? 'test-client-id.apps.googleusercontent.com';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/currencies (GET) returns seeded catalog', () => {
    return request(app.getHttpServer())
      .get('/currencies')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/auth/google (POST) rejects invalid token', () => {
    return request(app.getHttpServer())
      .post('/auth/google')
      .send({ idToken: 'invalid' })
      .expect(401);
  });
});
