import { GET_PROFITABILITY_CONFIG } from '../getProfitability.config';
import {
  CostosCalculadosResult,
  CostosOperativosResult,
  DatosBaseResult,
} from '../getProfitability.types';

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

function normalizePercentageToDecimal(value: number): number {
  return value > 1 ? value / 100 : value;
}

export function calculateCostosCalculados(
  datosBase: DatosBaseResult,
  costosOperativos: CostosOperativosResult,
): CostosCalculadosResult {
  const salePrice = datosBase.sellerNetPrice;
  const comisionMpPercentage = normalizePercentageToDecimal(
    costosOperativos.commissionMpPercentage,
  );

  return {
    utilidadAmount: roundCurrency(
      salePrice * GET_PROFITABILITY_CONFIG.utilityPercent,
    ),
    impuestosMeliAmount: roundCurrency(
      salePrice * GET_PROFITABILITY_CONFIG.meliTaxesPercent,
    ),
    comisionMpAmount: roundCurrency(salePrice * comisionMpPercentage),
  };
}
