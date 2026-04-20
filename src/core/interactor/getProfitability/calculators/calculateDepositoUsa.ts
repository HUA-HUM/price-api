function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateDepositoUsa(tcTLQ: number): number {
  return roundCurrency(20 * tcTLQ);
}
