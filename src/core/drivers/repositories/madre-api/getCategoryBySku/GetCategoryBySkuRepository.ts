import { BadRequestException, Injectable } from '@nestjs/common';
import { IGetCategoryBySkuRepository } from 'src/core/adapters/madre-api/getCategoryBySku/IGetCategoryBySkuRepository';
import {
  MadreCategoryBySkuBulkResponse,
  MadreCategoryBySkuItemDto,
} from 'src/core/entitis/madre-api/getCategoryBySku/MadreCategoryBySkuResponse';
import { MadreHttpClient } from '../http/MadreHttpClient';

@Injectable()
export class GetCategoryBySkuRepository implements IGetCategoryBySkuRepository {
  constructor(private readonly madreHttpClient: MadreHttpClient) {}

  async getBySkus(skus: string[]): Promise<MadreCategoryBySkuItemDto[]> {
    if (!skus?.length) {
      throw new BadRequestException('skus are required');
    }

    const sanitizedSkus = skus.filter((sku) => sku?.trim());

    if (!sanitizedSkus.length) {
      throw new BadRequestException('skus are required');
    }

    const response =
      await this.madreHttpClient.post<MadreCategoryBySkuBulkResponse>(
        '/api/mercadolibre/products/categories/by-skus',
        { skus: sanitizedSkus },
        {
          params: {
            offset: 0,
            limit: sanitizedSkus.length,
          },
        },
      );

    return response.items ?? [];
  }
}
