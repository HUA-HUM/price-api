import { DolarEntity } from 'src/core/entitis/getDolar/DolarEntity';

export const GET_DOLAR_REPOSITORY = Symbol('GET_DOLAR_REPOSITORY');

export interface IGetDolarRepository {
  getOfficial(): Promise<DolarEntity>;
}
