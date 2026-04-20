import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosRequestConfig, Method } from 'axios';
import * as http from 'node:http';
import * as https from 'node:https';
import { MadreHttpError } from './errors/MadreHttpError';

type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
};

type RequestAuthMode = 'public' | 'internal';

@Injectable()
export class MadreHttpClient {
  constructor(private readonly configService: ConfigService) {}

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', url, undefined, options, 'public');
  }

  async internalGet<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', url, undefined, options, 'internal');
  }

  async post<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>('POST', url, body, options, 'public');
  }

  async internalPost<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>('POST', url, body, options, 'internal');
  }

  async put<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>('PUT', url, body, options, 'public');
  }

  async internalPut<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>('PUT', url, body, options, 'internal');
  }

  async patch<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>('PATCH', url, body, options, 'public');
  }

  async internalPatch<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>('PATCH', url, body, options, 'internal');
  }

  private async request<T>(
    method: Method,
    url: string,
    data?: unknown,
    options?: RequestOptions,
    authMode: RequestAuthMode = 'public',
  ): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        baseURL: this.getBaseUrl(),
        method,
        url,
        data,
        params: options?.params,
        timeout: 30000,
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...this.getAuthHeaders(authMode),
          ...options?.headers,
        },
      };

      const response = await axios.request<T>(config);
      return response.data;
    } catch (error) {
      throw this.handleError(method, url, error);
    }
  }

  private handleError(
    method: string,
    url: string,
    error: unknown,
  ): MadreHttpError {
    const err = error as AxiosError;

    if (err.response) {
      return new MadreHttpError(
        err.response.status,
        {
          method,
          url,
          data: err.response.data,
          baseURL: this.configService.get<string>('MADRE_API_BASE_URL'),
        },
        `[MADRE ${method}] ${url}`,
      );
    }

    return new MadreHttpError(
      500,
      {
        message: err.message,
        code: err.code,
        baseURL: this.configService.get<string>('MADRE_API_BASE_URL'),
        url,
        method,
      },
      `[MADRE ${method}] ${url}`,
    );
  }

  private getBaseUrl(): string {
    const baseURL = this.configService.get<string>('MADRE_API_BASE_URL');

    if (!baseURL) {
      throw new MadreHttpError(
        500,
        {
          configKey: 'MADRE_API_BASE_URL',
        },
        'MADRE_API_BASE_URL is not defined',
      );
    }

    return baseURL;
  }

  private getAuthHeaders(authMode: RequestAuthMode): Record<string, string> {
    if (authMode === 'public') {
      return {};
    }

    const internalApiKey = this.configService.get<string>(
      'MADRE_INTERNAL_API_KEY',
    );

    if (!internalApiKey) {
      throw new MadreHttpError(
        500,
        {
          configKey: 'MADRE_INTERNAL_API_KEY',
        },
        'MADRE_INTERNAL_API_KEY is not defined',
      );
    }

    return {
      'x-internal-api-key': internalApiKey,
    };
  }
}
