import { Controller, Get, INestApplication, NotFoundException, BadRequestException } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { DependencyError } from '../../core/errors/DependencyError';
import { MadreHttpError } from '../../core/drivers/repositories/madre-api/http/errors/MadreHttpError';

@Controller('t')
class ThrowController {
  @Get('dep') dep() { throw new DependencyError('meli-api', 500, 'Request failed with status code 500'); }
  @Get('madre') madre() { throw new MadreHttpError(500, null, '[MADRE GET] /x'); }
  @Get('plain') plain() { throw new Error('boom'); }
  @Get('notfound') notfound() { throw new NotFoundException('No product status found for sku X'); }
  @Get('badreq') badreq() { throw new BadRequestException('mla is required'); }
}

describe('AllExceptionsFilter', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ThrowController],
      providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useLogger(false);
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('devuelve 503 cuando el que fallo fue una dependencia, no price-api', async () => {
    const res = await request(app.getHttpServer()).get('/t/dep').expect(503);
    expect(res.body.statusCode).toBe(503);
    expect(res.body.message).toBe('Internal server error');
  });

  it('agrega la causa y la dependencia que fallo', async () => {
    const res = await request(app.getHttpServer()).get('/t/dep');
    expect(res.body.errorCode).toBe('PRICE_DEP_FAILURE');
    expect(res.body.failedDependency).toBe('meli-api');
    expect(res.body.cause).toContain('status 500');
    expect(res.body.correlationId).toEqual(expect.any(String));
  });

  it('mapea MadreHttpError a madre-api', async () => {
    const res = await request(app.getHttpServer()).get('/t/madre');
    expect(res.body.failedDependency).toBe('madre-api');
    expect(res.body.errorCode).toBe('PRICE_DEP_FAILURE');
  });

  it('marca los errores no clasificados como unhandled y los deja en 500', async () => {
    const res = await request(app.getHttpServer()).get('/t/plain').expect(500);
    expect(res.body.errorCode).toBe('PRICE_UNHANDLED_ERROR');
    expect(res.body.failedDependency).toBeNull();
    expect(res.body.cause).toBe('boom');
  });

  it('no toca los HttpException explicitos (404 y 400 quedan igual)', async () => {
    const nf = await request(app.getHttpServer()).get('/t/notfound').expect(404);
    expect(nf.body).toEqual({ statusCode: 404, message: 'No product status found for sku X', error: 'Not Found' });

    const br = await request(app.getHttpServer()).get('/t/badreq').expect(400);
    expect(br.body).toEqual({ statusCode: 400, message: 'mla is required', error: 'Bad Request' });
  });
});
