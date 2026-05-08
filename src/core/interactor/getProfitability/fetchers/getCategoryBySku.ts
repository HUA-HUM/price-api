import { Inject, Injectable } from '@nestjs/common';
import {
  GET_CATEGORY_BY_SKU_REPOSITORY,
} from 'src/core/adapters/madre-api/getCategoryBySku/IGetCategoryBySkuRepository';
import type { IGetCategoryBySkuRepository } from 'src/core/adapters/madre-api/getCategoryBySku/IGetCategoryBySkuRepository';

@Injectable()
export class GetCategoryBySkuInteractor {
  constructor(
    @Inject(GET_CATEGORY_BY_SKU_REPOSITORY)
    private readonly repository: IGetCategoryBySkuRepository,
  ) {}

  async execute(sku: string): Promise<string | null> {
    const items = await this.repository.getBySkus([sku]);

    if (!items.length) {
      return null;
    }

    const item = items.find((candidate) => candidate.sku === sku) ?? items[0];
    return item.matches?.[0]?.categoryId ?? null;
  }
}
