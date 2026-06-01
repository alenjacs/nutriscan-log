export type ServingUnit = "g" | "ml" | "serving";

export type NutritionValues = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
  sodiumMg: number;
};

export type FoodLogEntry = {
  id: string;
  name: string;
  brand: string;
  servingSizeValue: number;
  servingSizeUnit: ServingUnit;
  consumedAmountValue: number;
  consumedAmountUnit: ServingUnit;
  scaleFactor: number;
  perServing: NutritionValues;
  logged: NutritionValues;
  createdAt: string;
};

export type NutritionFormDraft = {
  id: string;
  servingSizeValue: string;
  servingSizeUnit: ServingUnit;
  consumedAmountValue: string;
  consumedAmountUnit: ServingUnit;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  sugarG: string;
  sodiumMg: string;
};