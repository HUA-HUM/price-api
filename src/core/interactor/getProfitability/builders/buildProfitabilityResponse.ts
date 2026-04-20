import { GetProfitabilityResponseDto } from 'src/app/controllers/GetProfitability/dto/get-profitability-response.dto';
import {
  DatosBaseResult,
  GetProfitabilityRequest,
  ProfitabilityDecisionResult,
  ResultadosResult,
} from '../getProfitability.types';

export function buildProfitabilityResponse(
  input: GetProfitabilityRequest,
  datosBase: DatosBaseResult,
  operatingProfit: ResultadosResult,
  decision: ProfitabilityDecisionResult,
): GetProfitabilityResponseDto {
  const meliContributionPercentage = input.meliContributionPercentage ?? 0;
  const salePrice = input.salePrice;
  const meliContributionAmount = Number(
    (datosBase.sellerNetPrice - salePrice).toFixed(2),
  );
  const sellerNetPrice = datosBase.sellerNetPrice;

  return {
    input: {
      mla: input.mla,
      categoryId: input.categoryId,
      publicationType: input.publicationType,
      sku: input.sku,
      salePrice,
      meliContributionPercentage,
    },
    prices: {
      salePrice,
      meliContributionPercentage,
      meliContributionAmount,
      sellerNetPrice,
    },
    economics: {
      cost: operatingProfit.totalCosts,
      profitAmount: operatingProfit.operatingProfit,
      profitabilityPercent: operatingProfit.operatingProfitPercent,
      marginPercent:
        sellerNetPrice > 0
          ? Number(
              (
                (operatingProfit.operatingProfit / sellerNetPrice) * 100
              ).toFixed(2),
            )
          : 0,
    },
    status: {
      profitable: decision.profitable,
      shouldPause: decision.shouldPause,
    },
  };
}
