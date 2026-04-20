import { MadreProductStatusDto } from 'src/core/entitis/madre-api/getPrice/dto/MadreProductStatusDto';

export const GET_MADRE_PRODUCTS_STATUS_REPOSITORY = Symbol(
  'GET_MADRE_PRODUCTS_STATUS_REPOSITORY',
);

export interface IGetMadreProductsStatusRepository {
  getBySkus(skus: string[]): Promise<MadreProductStatusDto[]>;
}
