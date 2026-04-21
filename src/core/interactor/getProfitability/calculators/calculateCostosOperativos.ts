import {
  CostosOperativosResult,
  DatosBaseResult,
  EmoResult,
  PricingFetchersResult,
  TiposDeCambioResult,
} from '../getProfitability.types';
import { calculateCostosAmco } from './calculateCostosAmco';
import { calculateDepositoUsa } from './calculateDepositoUsa';

const ENVIO_ML_PROMEDIO_AMOUNT = 11000;

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateCostosOperativos(
  fetchers: PricingFetchersResult,
  datosBase: DatosBaseResult,
  tiposDeCambio: TiposDeCambioResult,
  emo: EmoResult,
): CostosOperativosResult {
  const commissionMpPercentage = fetchers.commissionCategory.percentage;
  const precioAmzAmount = roundCurrency(
    fetchers.productStatus.amazonPrice * tiposDeCambio.tcTlq,
  );
  const depositoUsaAmount = calculateDepositoUsa(tiposDeCambio.tcTlq);
  const costosAmcoAmount = calculateCostosAmco({
    pesoVolumetrico: datosBase.volumetricWeightKg,
    tcAmco: tiposDeCambio.tcAmco,
    precioAmzAmount,
  });
  const importBaseAmount = roundCurrency(
    precioAmzAmount * 1.01 + 2.5 * datosBase.weightKg * tiposDeCambio.tcTlq,
  );
  const thresholdAmount = roundCurrency(400 * tiposDeCambio.tcTlq);
  const taxableExcessAmount =
    importBaseAmount > thresholdAmount
      ? roundCurrency(importBaseAmount - thresholdAmount)
      : 0;
  const imptosAmcoExcessAmount = roundCurrency(
    taxableExcessAmount * emo.sumaTasasYDer,
  );
  const imptosAmcoAmount = roundCurrency(
    imptosAmcoExcessAmount +
      (imptosAmcoExcessAmount + importBaseAmount) * emo.ivaCatAranc,
  );

  return {
    commissionMpPercentage,
    envioMlAmount: ENVIO_ML_PROMEDIO_AMOUNT,
    precioAmzAmount,
    depositoUsaAmount,
    costosAmcoAmount,
    imptosAmcoAmount,
  };
}
