import { BadRequestException, Injectable } from '@nestjs/common';
import { MadreHttpClient } from '../http/MadreHttpClient';
import { MadreProductStatusDto } from 'src/core/entitis/madre-api/getPrice/dto/MadreProductStatusDto';
import { IGetMadreProductsStatusRepository } from 'src/core/adapters/madre-api/getPriceSku/IGetMadreProductsStatusRepository';
import { MadreProductsStatusBulkResponse } from 'src/core/entitis/madre-api/getPrice/MadreProductStatusResponse';

@Injectable()
export class GetMadreProductsStatusRepository implements IGetMadreProductsStatusRepository {
  constructor(private readonly httpClient: MadreHttpClient) {}

  async getBySkus(skus: string[]): Promise<MadreProductStatusDto[]> {
    if (!skus?.length) {
      throw new BadRequestException('skus are required');
    }

    const sanitizedSkus = skus.filter((sku) => sku?.trim());

    if (!sanitizedSkus.length) {
      throw new BadRequestException('skus are required');
    }

    const response =
      await this.httpClient.post<MadreProductsStatusBulkResponse>(
        '/api/products/madre/status/bulk',
        {
          skus: sanitizedSkus,
        },
      );

    return response.items ?? [];
  }
}
