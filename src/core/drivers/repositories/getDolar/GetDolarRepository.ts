import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { IGetDolarRepository } from 'src/core/adapters/getDolar/IGetDolarRepository';
import { DolarEntity } from 'src/core/entitis/getDolar/DolarEntity';

type CriptoYaDolarResponse = {
  oficial?: {
    price?: number;
  };
  mep: {
    al30?: {
      '24hs'?: {
        price?: number;
      };
    };
    gd30?: {
      '24hs'?: {
        price?: number;
      };
    };
  };
};

@Injectable()
export class GetDolarRepository implements IGetDolarRepository {
  private static readonly CACHE_TTL_MS = 12 * 60 * 60 * 1000;
  private static readonly REQUEST_TIMEOUT_MS = 5_000;

  private readonly url = 'https://criptoya.com/api/dolar';
  private readonly logger = new Logger(GetDolarRepository.name);
  private cachedValue?: { value: DolarEntity; expiresAt: number };
  private inFlightRequest?: Promise<DolarEntity>;

  async getOfficial(): Promise<DolarEntity> {
    const now = Date.now();
    if (this.cachedValue && this.cachedValue.expiresAt > now) {
      return this.cachedValue.value;
    }

    if (this.inFlightRequest) {
      return this.inFlightRequest;
    }

    this.inFlightRequest = this.fetchOfficial().finally(() => {
      this.inFlightRequest = undefined;
    });

    return this.inFlightRequest;
  }

  private async fetchOfficial(): Promise<DolarEntity> {
    try {
      const response = await axios.get<CriptoYaDolarResponse>(this.url, {
        timeout: GetDolarRepository.REQUEST_TIMEOUT_MS,
        headers: {
          accept: 'application/json',
        },
      });

      const buy = response.data.mep.al30?.['24hs']?.price;
      const sell = response.data.mep.gd30?.['24hs']?.price;
      const officialBuy = response.data.oficial?.price;

      if (
        typeof buy !== 'number' ||
        typeof sell !== 'number' ||
        typeof officialBuy !== 'number'
      ) {
        throw new Error(
          'No se pudo obtener la cotizacion MEP y oficial desde CriptoYa',
        );
      }

      const value = {
        buy,
        sell,
        officialBuy,
      };

      this.cachedValue = {
        value,
        expiresAt: Date.now() + GetDolarRepository.CACHE_TTL_MS,
      };

      return value;
    } catch (error) {
      if (this.cachedValue) {
        this.logger.warn(
          `Falling back to cached dolar value because CriptoYa request failed: ${this.formatError(error)}`,
        );
        return this.cachedValue.value;
      }

      throw new Error(
        `No se pudo obtener la cotizacion desde CriptoYa: ${this.formatError(error)}`,
      );
    }
  }

  private formatError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return [
        axiosError.code,
        axiosError.response?.status
          ? `status ${axiosError.response.status}`
          : undefined,
        axiosError.response?.data?.message,
        axiosError.message,
      ]
        .filter(Boolean)
        .join(' - ');
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
