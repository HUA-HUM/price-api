import {
  DatosBaseResult,
  PricingFetchersResult,
} from '../getProfitability.types';
import { calculatepesoVolumetrico } from './calculatepesoVolumetrico';

const POUNDS_TO_KILOGRAMS = 0.45359237;

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

function roundWeight(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateDatosBase(
  fetchers: PricingFetchersResult,
): DatosBaseResult {
  const salePrice = fetchers.body.salePrice;
  const meliContributionPercentage =
    fetchers.body.meliContributionPercentage ?? 0;
  const meliContributionAmount = roundCurrency(
    (salePrice * meliContributionPercentage) / 100,
  );
  const sellerNetPrice = roundCurrency(salePrice + meliContributionAmount);
  const weightKg = roundWeight(
    fetchers.productStatus.maxWeight * POUNDS_TO_KILOGRAMS,
  );

  return {
    sku: fetchers.productStatus.sku,
    weightKg,
    volumetricWeightKg: calculatepesoVolumetrico(weightKg),
    sellerNetPrice,
    categoryId: fetchers.body.categoryId,
  };
}
