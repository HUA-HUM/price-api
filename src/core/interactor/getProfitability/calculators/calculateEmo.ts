import { EmoResult, PricingFetchersResult } from '../getProfitability.types';

function normalizeIvaCatAranc(value: number): number {
  return value === 0.11 ? 0.105 : value;
}

export function calculateEmo(fetchers: PricingFetchersResult): EmoResult {
  return {
    ivaCatAranc: normalizeIvaCatAranc(
      fetchers.taxes.composicion_conf_automeli_iva,
    ),
    sumaTasasYDer: fetchers.taxes.composicion_conf_automeli_imp2,
  };
}
