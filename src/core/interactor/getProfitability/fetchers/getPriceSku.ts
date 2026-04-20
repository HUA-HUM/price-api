import { Inject, Injectable } from '@nestjs/common';
import {
  GET_MADRE_PRODUCTS_STATUS_REPOSITORY,
} from 'src/core/adapters/madre-api/getPriceSku/IGetMadreProductsStatusRepository';
import type { IGetMadreProductsStatusRepository } from 'src/core/adapters/madre-api/getPriceSku/IGetMadreProductsStatusRepository';
import { MadreProductStatusDto } from 'src/core/entitis/madre-api/getPrice/dto/MadreProductStatusDto';

@Injectable()
export class GetPriceSkuInteractor {
  constructor(
    @Inject(GET_MADRE_PRODUCTS_STATUS_REPOSITORY)
    private readonly repository: IGetMadreProductsStatusRepository,
  ) {}

  async execute(sku: string): Promise<MadreProductStatusDto | null> {
    const items = await this.repository.getBySkus([sku]);

    if (!items.length) {
      return null;
    }

    return items.find((item) => item.sku === sku) ?? items[0];
  }
}
