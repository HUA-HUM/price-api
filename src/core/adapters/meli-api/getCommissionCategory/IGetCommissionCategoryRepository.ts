import { MeliCommissionCategoryEntity } from 'src/core/entitis/meli-api/getCommissionCategory/MeliCommissionCategory';

export const GET_COMMISSION_CATEGORY_REPOSITORY = Symbol(
  'GET_COMMISSION_CATEGORY_REPOSITORY',
);

export interface GetCommissionCategoryParams {
  mla: string;
  price: number;
  categoryId: string;
  listingTypeId: string;
}

export interface IGetCommissionCategoryRepository {
  getByProduct(
    params: GetCommissionCategoryParams,
  ): Promise<MeliCommissionCategoryEntity>;
}
