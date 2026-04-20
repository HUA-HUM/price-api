import {
  CostosCalculadosResult,
  CostosOperativosResult,
  DatosBaseResult,
  ResultadosResult,
} from '../getProfitability.types';

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

function roundPercentage(value: number): number {
  return Number(value.toFixed(4));
}

export function calculateResultados(
  datosBase: DatosBaseResult,
  costosOperativos: CostosOperativosResult,
  costosCalculados: CostosCalculadosResult,
): ResultadosResult {
  const totalCosts = roundCurrency(
    costosCalculados.utilidadAmount +
      costosCalculados.impuestosMeliAmount +
      costosCalculados.comisionMpAmount +
      costosOperativos.envioMlAmount +
      costosOperativos.precioAmzAmount +
      costosOperativos.depositoUsaAmount +
      costosOperativos.costosAmcoAmount +
      costosOperativos.imptosAmcoAmount,
  );

  const operatingProfit = roundCurrency(datosBase.sellerNetPrice - totalCosts);
  const operatingProfitPercent =
    datosBase.sellerNetPrice > 0
      ? roundPercentage(operatingProfit / datosBase.sellerNetPrice)
      : 0;

  return {
    totalCosts,
    operatingProfit,
    operatingProfitPercent,
  };
}
