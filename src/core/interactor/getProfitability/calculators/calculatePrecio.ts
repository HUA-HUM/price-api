import { GET_PROFITABILITY_CONFIG } from '../getProfitability.config';
import {
  CostosOperativosResult,
  DatosBaseResult,
  PrecioResult,
} from '../getProfitability.types';

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

function normalizePercentageToDecimal(value: number): number {
  return value > 1 ? value / 100 : value;
}

export function calculatePrecio(
  datosBase: DatosBaseResult,
  costosOperativos: CostosOperativosResult,
): PrecioResult {
  const fixedCosts =
    costosOperativos.envioMlAmount +
    costosOperativos.precioAmzAmount +
    costosOperativos.depositoUsaAmount +
    costosOperativos.costosAmcoAmount +
    costosOperativos.imptosAmcoAmount;

  const commissionMpPercentage = normalizePercentageToDecimal(
    costosOperativos.commissionMpPercentage,
  );

  const denominator =
    1 -
    GET_PROFITABILITY_CONFIG.utilityPercent -
    GET_PROFITABILITY_CONFIG.meliTaxesPercent -
    commissionMpPercentage -
    GET_PROFITABILITY_CONFIG.targetOperatingProfitPercent;

  const suggestedPrice =
    denominator > 0 ? roundCurrency(fixedCosts / denominator) : 0;

  const discount =
    datosBase.sellerNetPrice > 0
      ? `${((1 - suggestedPrice / datosBase.sellerNetPrice) * 100).toFixed(2)}%`
      : '0.00%';

  return {
    suggestedPrice,
    discount,
  };
}
