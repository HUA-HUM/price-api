function roundWeight(value: number): number {
  return Number(value.toFixed(2));
}

export function calculatepesoVolumetrico(weightKg: number): number {
  return roundWeight(weightKg * 1.35);
}
