import { DolarEntity } from 'src/core/entitis/getDolar/DolarEntity';
import { TiposDeCambioResult } from '../getProfitability.types';

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateValorDolar(
  officialDolar: DolarEntity,
): TiposDeCambioResult {
  return {
    tcAmco: roundCurrency(officialDolar.officialBuy * 1.02),
    tcTlq: roundCurrency(officialDolar.buy * 1.025),
  };
}
