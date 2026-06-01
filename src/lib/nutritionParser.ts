import type { NutritionValues, ServingUnit } from "./types";

export type ParsedNutritionResult = {
  servingSizeValue: number;
  servingSizeUnit: ServingUnit;
  nutrition: NutritionValues;
};

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[–—]/g, "-")
    .replace(/,/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function getLines(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) =>
      line
        .replace(/[–—]/g, "-")
        .replace(/,/g, ".")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

function toNumber(value: string | undefined): number {
  if (!value) return 0;

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanOcrNumberForGrams(raw: string): number {
  const cleaned = raw.replace(",", ".").replace(/[^\d.]/g, "");

  if (!cleaned) return 0;

  if (cleaned.includes(".")) {
    return toNumber(cleaned);
  }

  // OCR often reads "13g" as "139"
  if (cleaned.length === 3 && cleaned.endsWith("9")) {
    return toNumber(cleaned.slice(0, -1));
  }

  // OCR often reads "0.5" as "05"
  if (cleaned.length === 2 && cleaned.startsWith("0")) {
    return toNumber(`${cleaned[0]}.${cleaned[1]}`);
  }

  return toNumber(cleaned);
}

function findCalories(text: string): number {
  const lines = getLines(text);

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (!lowerLine.includes("calories")) continue;

    const caloriesIndex = lowerLine.indexOf("calories");
    const afterCalories = line.slice(caloriesIndex + "calories".length);

    const matches = afterCalories.match(/\d+(?:\.\d+)?/g);

    if (!matches) continue;

    for (const match of matches) {
      const value = toNumber(match);

      // Reject OCR noise like "Calories omega 0"
      if (value >= 5 && value <= 2000) {
        return value;
      }
    }
  }

  const compact = normalizeText(text);
  const kcalMatch = compact.match(/(\d+(?:\.\d+)?)\s*kcal/i);

  if (kcalMatch) {
    const value = toNumber(kcalMatch[1]);

    if (value >= 5 && value <= 2000) {
      return value;
    }
  }

  return 0;
}

function extractServingSize(text: string): {
  servingSizeValue: number;
  servingSizeUnit: ServingUnit;
} {
  const compact = normalizeText(text);

  const patterns = [
    /serving size[^0-9]{0,40}(\d+(?:\.\d+)?)\s*(g|ml)/i,
    /per\s+[^(]{0,80}\((\d+(?:\.\d+)?)\s*(g|ml|9)\)/i,
    /per[^0-9]{0,80}(\d+(?:\.\d+)?)\s*(g|ml|9)/i,
    /\((\d+(?:\.\d+)?)\s*(g|ml|9)\)/i,
  ];

  for (const pattern of patterns) {
    const match = compact.match(pattern);

    if (match) {
      const value = toNumber(match[1]);
      const rawUnit = match[2].toLowerCase();
      const unit = rawUnit === "9" ? "g" : (rawUnit as ServingUnit);

      if (value > 0 && (unit === "g" || unit === "ml")) {
        return {
          servingSizeValue: value,
          servingSizeUnit: unit,
        };
      }
    }
  }

  return {
    servingSizeValue: 100,
    servingSizeUnit: "g",
  };
}

function findGramNutrient(
  text: string,
  keywords: string[],
  blockedWords: string[] = []
): number {
  const lines = getLines(text);

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    const hasKeyword = keywords.some((keyword) =>
      lowerLine.includes(keyword.toLowerCase())
    );

    if (!hasKeyword) continue;

    const isBlocked = blockedWords.some((word) =>
      lowerLine.includes(word.toLowerCase())
    );

    if (isBlocked) continue;

    for (const keyword of keywords) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const patterns = [
        new RegExp(
          `${escapedKeyword}[^0-9]{0,50}(\\d+(?:\\.\\d+)?)\\s*(?:g|9|¢)?`,
          "i"
        ),
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);

        if (match) {
          return cleanOcrNumberForGrams(match[1]);
        }
      }
    }
  }

  return 0;
}

function findMilligramNutrient(text: string, keywords: string[]): number {
  const lines = getLines(text);

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    const hasKeyword = keywords.some((keyword) =>
      lowerLine.includes(keyword.toLowerCase())
    );

    if (!hasKeyword) continue;

    for (const keyword of keywords) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const patterns = [
        new RegExp(`${escapedKeyword}[^0-9]{0,50}(\\d+(?:\\.\\d+)?)\\s*mg`, "i"),
        new RegExp(`${escapedKeyword}[^0-9]{0,50}(\\d{1,4})`, "i"),
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);

        if (match) {
          return toNumber(match[1]);
        }
      }
    }
  }

  return 0;
}

export function parseNutritionText(text: string): ParsedNutritionResult {
  const serving = extractServingSize(text);

  const calories = findCalories(text);

  const proteinG = findGramNutrient(text, [
    "protein",
    "proteins",
    "proteln",
    "protéines",
  ]);

  const carbsG = findGramNutrient(text, [
    "carbohydrate",
    "carbohydrates",
    "carbs",
    "glucides",
  ]);

  const fatG = findGramNutrient(
    text,
    ["fat", "lipides", "flipides"],
    [
      "saturated",
      "satures",
      "saturés",
      "trans",
      "polyunsaturated",
      "polyinsaturés",
      "monounsaturated",
      "monoinsaturés",
      "omega",
    ]
  );

  const sugarG = findGramNutrient(
    text,
    ["sugars", "sugar", "sucres", "sucre"],
    ["not a significant source", "source négligeable"]
  );

  const sodiumMg = findMilligramNutrient(text, ["sodium"]);

  return {
    servingSizeValue: serving.servingSizeValue,
    servingSizeUnit: serving.servingSizeUnit,
    nutrition: {
      calories,
      proteinG,
      carbsG,
      fatG,
      sugarG,
      sodiumMg,
    },
  };
}