import { TaxCategory } from 'src/core/entitis/madre-api/getTaxes/TaxCategory';

export const GET_TAXES_REPOSITORY = Symbol('GET_TAXES_REPOSITORY');

export interface IGetTaxesRepository {
  getByMla(mla: string): Promise<TaxCategory>;
}
