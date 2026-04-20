import { GET_PROFITABILITY_CONFIG } from '../getProfitability.config';
import { DatosBaseResult } from '../getProfitability.types';

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateImpuestosMeli(
  datosBase: DatosBaseResult,
): number {
  return roundCurrency(
    datosBase.sellerNetPrice * GET_PROFITABILITY_CONFIG.meliTaxesPercent,
  );
}
