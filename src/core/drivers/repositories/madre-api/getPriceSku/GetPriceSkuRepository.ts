import { BadRequestException, Injectable } from '@nestjs/common';
import { MadreHttpClient } from '../http/MadreHttpClient';
import { MadreProductStatusDto } from 'src/core/entitis/madre-api/getPrice/dto/MadreProductStatusDto';
import { IGetMadreProductsStatusRepository } from 'src/core/adapters/madre-api/getPriceSku/IGetMadreProductsStatusRepository';
import {
  MadreProductSnapshotItemResponse,
  MadreProductsStatusBulkResponse,
} from 'src/core/entitis/madre-api/getPrice/MadreProductStatusResponse';

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
        '/api/automeli/product-snapshots/search',
        {
          skus: sanitizedSkus,
          fields: ['sku', 'totalPrice', 'maxWeight'],
          uniqueBySku: true,
        },
      );

    return (response.items ?? []).map((item) => this.mapSnapshotItem(item));
  }

  private mapSnapshotItem(
    item: MadreProductSnapshotItemResponse,
  ): MadreProductStatusDto {
    return {
      sku: item.sku,
      price: item.scrapedPrice ?? item.totalPrice,
      amazonPrice: item.totalPrice,
      maxWeight: item.maxWeight,
      stock: item.stockQuantity ?? 0,
      status: item.amzStatus ?? '',
    };
  }
}
