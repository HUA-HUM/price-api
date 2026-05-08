import { MadreCategoryBySkuItemDto } from 'src/core/entitis/madre-api/getCategoryBySku/MadreCategoryBySkuResponse';

export const GET_CATEGORY_BY_SKU_REPOSITORY = Symbol(
  'GET_CATEGORY_BY_SKU_REPOSITORY',
);

export interface IGetCategoryBySkuRepository {
  getBySkus(skus: string[]): Promise<MadreCategoryBySkuItemDto[]>;
}
