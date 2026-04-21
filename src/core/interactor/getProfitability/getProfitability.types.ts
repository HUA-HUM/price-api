import {
  GetProfitabilityRequestWithContributionDto,
  GetProfitabilityRequestWithoutContributionDto,
} from 'src/app/controllers/GetProfitability/dto/get-profitability-request.dto';
import { MeliCommissionCategoryEntity } from 'src/core/entitis/meli-api/getCommissionCategory/MeliCommissionCategory';
import { DolarEntity } from 'src/core/entitis/getDolar/DolarEntity';
import { MadreProductStatusDto } from 'src/core/entitis/madre-api/getPrice/dto/MadreProductStatusDto';
import { TaxCategory } from 'src/core/entitis/madre-api/getTaxes/TaxCategory';

export type GetProfitabilityRequest =
  | GetProfitabilityRequestWithContributionDto
  | GetProfitabilityRequestWithoutContributionDto;

export interface PricingFetchersResult {
  body: GetProfitabilityRequest;
  productStatus: MadreProductStatusDto;
  officialDolar: DolarEntity;
  taxes: TaxCategory;
  commissionCategory: MeliCommissionCategoryEntity;
}

export interface DatosBaseResult {
  sku: string;
  weightKg: number;
  volumetricWeightKg: number;
  sellerNetPrice: number;
  categoryId: string;
}

export interface TiposDeCambioResult {
  tcAmco: number;
  tcTlq: number;
}

export interface CostosOperativosResult {
  commissionMpPercentage: number;
  envioMlAmount: number;
  precioAmzAmount: number;
  depositoUsaAmount: number;
  costosAmcoAmount: number;
  imptosAmcoAmount: number;
}

export interface EmoResult {
  ivaCatAranc: number;
  sumaTasasYDer: number;
}

export interface CostosCalculadosResult {
  utilidadAmount: number;
  impuestosMeliAmount: number;
  comisionMpAmount: number;
}

export interface ResultadosResult {
  totalCosts: number;
  operatingProfit: number;
  operatingProfitPercent: number;
}

export interface PrecioResult {
  suggestedPrice: number;
  discount: string;
}

export interface GetProfitabilityDetailedResult {
  input: {
    mla: string;
    categoryId: string;
    publicationType: string;
    sku: string;
    salePrice: number;
    meliContributionPercentage: number;
  };
  prices: {
    salePrice: number;
    meliContributionPercentage: number;
    meliContributionAmount: number;
    sellerNetPrice: number;
  };
  datosBase: DatosBaseResult;
  tiposDeCambio: TiposDeCambioResult;
  costosOperativos: CostosOperativosResult;
  emo: EmoResult;
  costosCalculados: CostosCalculadosResult;
  resultados: {
    totalCosts: number;
    operatingProfit: number;
    operatingProfitPercent: string;
  };
  precio: PrecioResult;
}

export interface SuggestedPriceResult {
  suggestedPrice: number;
}

export interface ProfitabilityDecisionResult {
  profitable: boolean;
  shouldPause: boolean;
  convenient: boolean;
  discount: number;
}
