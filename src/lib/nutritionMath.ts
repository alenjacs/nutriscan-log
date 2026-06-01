import type { NutritionValues } from "./types";

export function roundNumber(value: number, decimals = 1): number {
  if (!Number.isFinite(value)) return 0;

  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calculateScaleFactor(
  consumedAmount: number,
  servingSize: number
): number {
  if (servingSize <= 0 || consumedAmount <= 0) return 0;

  return consumedAmount / servingSize;
}

export function calculateLoggedNutrition(
  perServing: NutritionValues,
  scaleFactor: number
): NutritionValues {
  return {
    calories: roundNumber(perServing.calories * scaleFactor, 0),
    proteinG: roundNumber(perServing.proteinG * scaleFactor),
    carbsG: roundNumber(perServing.carbsG * scaleFactor),
    fatG: roundNumber(perServing.fatG * scaleFactor),
    sugarG: roundNumber(perServing.sugarG * scaleFactor),
    sodiumMg: roundNumber(perServing.sodiumMg * scaleFactor, 0),
  };
}

export function getEmptyNutritionValues(): NutritionValues {
  return {
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    sugarG: 0,
    sodiumMg: 0,
  };
}