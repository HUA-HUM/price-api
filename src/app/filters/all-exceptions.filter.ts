import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { DependencyError } from '../../core/errors/DependencyError';
import { MadreHttpError } from '../../core/drivers/repositories/madre-api/http/errors/MadreHttpError';

type FailureContext = {
  errorCode: 'PRICE_DEP_FAILURE' | 'PRICE_UNHANDLED_ERROR';
  failedDependency: string | null;
  reason: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * Status para fallos de dependencia: el request estaba bien y se cayo algo
   * aguas abajo (meli-api, madre-api, criptoya), asi que reintentar tiene
   * sentido. Los errores realmente inesperados siguen siendo 500.
   *
   * Verificado antes de activarlo: ningun consumidor branchea por codigo de
   * status, y el nginx del droplet hace un proxy_pass directo sin
   * proxy_next_upstream ni proxy_intercept_errors, asi que el 503 no dispara
   * reintentos de infra ni le pisa el body a esta respuesta.
   */
  private static readonly DEPENDENCY_FAILURE_STATUS =
    HttpStatus.SERVICE_UNAVAILABLE;

  private static readonly MAX_LOGGED_BODY_CHARS = 500;

  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Los errores HTTP explicitos (400 de validacion, 404 de NotFound) ya tienen
    // contrato con los consumidores: se devuelven intactos.
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    const correlationId = randomUUID();
    const context = this.describe(exception);
    const status =
      context.errorCode === 'PRICE_DEP_FAILURE'
        ? AllExceptionsFilter.DEPENDENCY_FAILURE_STATUS
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(
      `${context.errorCode} | correlationId=${correlationId} | dependency=${
        context.failedDependency ?? 'none'
      } | ${request.method} ${request.url} | reason=${context.reason} | body=${this.previewBody(
        request,
      )}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      // Se mantienen tal cual estaban para no romper a ningun consumidor.
      statusCode: status,
      message: 'Internal server error',
      // Campos nuevos, aditivos.
      errorCode: context.errorCode,
      failedDependency: context.failedDependency,
      cause: context.reason,
      correlationId,
    });
  }

  private describe(exception: unknown): FailureContext {
    if (exception instanceof DependencyError) {
      return {
        errorCode: 'PRICE_DEP_FAILURE',
        failedDependency: exception.dependency,
        reason: exception.statusCode
          ? `${exception.reason} (status ${exception.statusCode})`
          : exception.reason,
      };
    }

    if (exception instanceof MadreHttpError) {
      return {
        errorCode: 'PRICE_DEP_FAILURE',
        failedDependency: 'madre-api',
        reason: `${exception.message} (status ${exception.statusCode})`,
      };
    }

    return {
      errorCode: 'PRICE_UNHANDLED_ERROR',
      failedDependency: null,
      reason: exception instanceof Error ? exception.message : 'Unknown error',
    };
  }

  private previewBody(request: Request): string {
    try {
      return JSON.stringify(request.body ?? null).slice(
        0,
        AllExceptionsFilter.MAX_LOGGED_BODY_CHARS,
      );
    } catch {
      return '<unserializable>';
    }
  }
}
