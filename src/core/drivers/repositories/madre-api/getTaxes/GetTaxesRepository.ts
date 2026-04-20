import { Injectable } from '@nestjs/common';
import { MadreHttpClient } from '../http/MadreHttpClient';
import { TaxCategory } from 'src/core/entitis/madre-api/getTaxes/TaxCategory';
import { IGetTaxesRepository } from 'src/core/adapters/madre-api/getTaxes/IGetTaxesRepository';

@Injectable()
export class GetTaxesRepository implements IGetTaxesRepository {
  constructor(private readonly madreHttpClient: MadreHttpClient) {}

  async getByMla(mla: string): Promise<TaxCategory> {
    return this.madreHttpClient.internalPost<TaxCategory>(
      '/api/internal/taxes/categories/by-mla',
      { mla },
    );
  }
}
