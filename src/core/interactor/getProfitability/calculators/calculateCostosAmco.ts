function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

interface CalculateCostosAmcoParams {
  pesoVolumetrico: number;
  tcAmco: number;
  precioAmzAmount: number;
}

export function calculateCostosAmco({
  pesoVolumetrico,
  tcAmco,
  precioAmzAmount,
}: CalculateCostosAmcoParams): number {
  const subtotalUsd =
    pesoVolumetrico * 7 +
    pesoVolumetrico * 0.65 * 1.1 +
    3 +
    (((250 / 200) + ((255 * 1.21) / 200)) * pesoVolumetrico);

  return roundCurrency(subtotalUsd * tcAmco + precioAmzAmount * 0.01);
}
