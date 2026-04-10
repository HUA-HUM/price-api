import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app/modules/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.API_KEY = 'test-api-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({
      status: 'ok',
    });
  });

  it('/ (GET) should reject requests without api key', () => {
    return request(app.getHttpServer()).get('/').expect(401);
  });

  it('/ (GET) should allow requests with api key', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('x-api-key', 'test-api-key')
      .expect(200)
      .expect({
        message: 'Price API protegida con API key',
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
