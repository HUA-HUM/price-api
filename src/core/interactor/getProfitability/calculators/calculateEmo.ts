import { EmoResult, PricingFetchersResult } from '../getProfitability.types';

export function calculateEmo(fetchers: PricingFetchersResult): EmoResult {
  return {
    ivaCatAranc: fetchers.taxes.composicion_conf_automeli_iva,
    sumaTasasYDer: fetchers.taxes.composicion_conf_automeli_imp2,
    ivaTasasYDer: fetchers.taxes.composicion_conf_automeli_imp3,
  };
}
