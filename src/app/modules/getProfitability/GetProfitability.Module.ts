import { Module } from '@nestjs/common';
import {
  GET_COMMISSION_CATEGORY_REPOSITORY,
} from '../../../core/adapters/meli-api/getCommissionCategory/IGetCommissionCategoryRepository';
import { GetProfitabilitycontroller } from '../../controllers/GetProfitability/GetProfitability.controller';
import { GetProfitabilityService } from '../../services/getProfitability/get-profitability.service';
import { GET_DOLAR_REPOSITORY } from '../../../core/adapters/getDolar/IGetDolarRepository';
import {
  GetCommissionCategoryInteractor,
} from '../../../core/interactor/getProfitability/fetchers/getCommissionCategory';
import {
  GET_TAXES_REPOSITORY,
} from '../../../core/adapters/madre-api/getTaxes/IGetTaxesRepository';
import {
  GET_CATEGORY_BY_SKU_REPOSITORY,
} from '../../../core/adapters/madre-api/getCategoryBySku/IGetCategoryBySkuRepository';
import { GetDolarValueInteractor } from '../../../core/interactor/getProfitability/fetchers/getDolarValue';
import { GetCategoryBySkuInteractor } from '../../../core/interactor/getProfitability/fetchers/getCategoryBySku';
import { GetPriceSkuInteractor } from '../../../core/interactor/getProfitability/fetchers/getPriceSku';
import { GetTaxesInteractor } from '../../../core/interactor/getProfitability/fetchers/getTaxes';
import { GetProfitabilityInteractor } from '../../../core/interactor/getProfitability/getProfitability';
import {
  GET_MADRE_PRODUCTS_STATUS_REPOSITORY,
} from '../../../core/adapters/madre-api/getPriceSku/IGetMadreProductsStatusRepository';
import { GetDolarRepository } from '../../../core/drivers/repositories/getDolar/GetDolarRepository';
import { GetCommissionCategoryRepository } from '../../../core/drivers/repositories/meli-api/getCommissionCategory/GetCommissionCategoryRepository';
import { GetCategoryBySkuRepository } from '../../../core/drivers/repositories/madre-api/getCategoryBySku/GetCategoryBySkuRepository';
import { GetMadreProductsStatusRepository } from '../../../core/drivers/repositories/madre-api/getPriceSku/GetPriceSkuRepository';
import { GetTaxesRepository } from '../../../core/drivers/repositories/madre-api/getTaxes/GetTaxesRepository';
import { MadreHttpClient } from '../../../core/drivers/repositories/madre-api/http/MadreHttpClient';

@Module({
  controllers: [GetProfitabilitycontroller],
  providers: [
    GetProfitabilityService,
    GetProfitabilityInteractor,
    GetPriceSkuInteractor,
    GetDolarValueInteractor,
    GetTaxesInteractor,
    GetCategoryBySkuInteractor,
    GetCommissionCategoryInteractor,
    MadreHttpClient,
    GetDolarRepository,
    GetCommissionCategoryRepository,
    GetCategoryBySkuRepository,
    GetMadreProductsStatusRepository,
    GetTaxesRepository,
    {
      provide: GET_DOLAR_REPOSITORY,
      useExisting: GetDolarRepository,
    },
    {
      provide: GET_MADRE_PRODUCTS_STATUS_REPOSITORY,
      useExisting: GetMadreProductsStatusRepository,
    },
    {
      provide: GET_COMMISSION_CATEGORY_REPOSITORY,
      useExisting: GetCommissionCategoryRepository,
    },
    {
      provide: GET_TAXES_REPOSITORY,
      useExisting: GetTaxesRepository,
    },
    {
      provide: GET_CATEGORY_BY_SKU_REPOSITORY,
      useExisting: GetCategoryBySkuRepository,
    },
  ],
})
export class GetProfitabilityModule {}
