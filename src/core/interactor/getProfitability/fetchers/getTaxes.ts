import { Inject, Injectable } from '@nestjs/common';
import {
  GET_TAXES_REPOSITORY,
} from 'src/core/adapters/madre-api/getTaxes/IGetTaxesRepository';
import type { IGetTaxesRepository } from 'src/core/adapters/madre-api/getTaxes/IGetTaxesRepository';
import { TaxCategory } from 'src/core/entitis/madre-api/getTaxes/TaxCategory';

@Injectable()
export class GetTaxesInteractor {
  constructor(
    @Inject(GET_TAXES_REPOSITORY)
    private readonly repository: IGetTaxesRepository,
  ) {}

  async execute(categoryMla: string): Promise<TaxCategory> {
    return this.repository.getByMla(categoryMla);
  }

  async executeMany(categoryMlas: string[]): Promise<Map<string, TaxCategory>> {
    const uniqueCategoryMlas = [...new Set(categoryMlas.filter((item) => item?.trim()))];
    const taxes = await Promise.all(
      uniqueCategoryMlas.map(async (categoryMla) => [
        categoryMla,
        await this.execute(categoryMla),
      ] as const),
    );

    return new Map(taxes);
  }
}
