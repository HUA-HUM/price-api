import { AxiosError } from 'axios';

/**
 * Error de una dependencia externa (meli-api, madre-api, CriptoYa, ...).
 * Existe para que el filtro global pueda decir CUAL fallo en vez de
 * devolver un 500 opaco.
 */
export class DependencyError extends Error {
  constructor(
    public readonly dependency: string,
    public readonly statusCode: number | null,
    public readonly reason: string,
    public readonly response: unknown = null,
  ) {
    super(`[${dependency}] ${reason}`);
    this.name = 'DependencyError';
  }

  static fromAxios(dependency: string, error: unknown): DependencyError {
    const axiosError = error as AxiosError;

    if (axiosError?.response) {
      return new DependencyError(
        dependency,
        axiosError.response.status,
        axiosError.message,
        axiosError.response.data ?? null,
      );
    }

    return new DependencyError(
      dependency,
      null,
      axiosError?.message ?? 'Unknown dependency error',
    );
  }
}
