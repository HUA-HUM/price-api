import { Inject, Injectable } from '@nestjs/common';
import {
  GET_COMMISSION_CATEGORY_REPOSITORY,
} from 'src/core/adapters/meli-api/getCommissionCategory/IGetCommissionCategoryRepository';
import type {
  GetCommissionCategoryParams,
  IGetCommissionCategoryRepository,
} from 'src/core/adapters/meli-api/getCommissionCategory/IGetCommissionCategoryRepository';
import { MeliCommissionCategoryEntity } from 'src/core/entitis/meli-api/getCommissionCategory/MeliCommissionCategory';

@Injectable()
export class GetCommissionCategoryInteractor {
  constructor(
    @Inject(GET_COMMISSION_CATEGORY_REPOSITORY)
    private readonly repository: IGetCommissionCategoryRepository,
  ) {}

  async execute(
    params: GetCommissionCategoryParams,
  ): Promise<MeliCommissionCategoryEntity> {
    return this.repository.getByProduct(params);
  }
}
