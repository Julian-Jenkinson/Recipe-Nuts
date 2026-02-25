import type { IngredientDetail } from "./types";

const RANGE_PATTERN = /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/;
const QUANTITY_PATTERN = /^(\d+(?:\.\d+)?)/;
const UNIT_PATTERN =
  /^(tsp|tbsp|ml|l|g|kg|oz|lb|cup|cups|pinch|clove|cloves|can|cans)\b/i;

export function parseIngredientDetail(rawInput: string): IngredientDetail {
  const raw = String(rawInput ?? "").trim();
  if (!raw) {
    return { raw: "", ingredient: "" };
  }

  let remaining = raw;
  let quantity: number | undefined;
  let quantityMax: number | undefined;

  const rangeMatch = remaining.match(RANGE_PATTERN);
  if (rangeMatch) {
    quantity = Number(rangeMatch[1]);
    quantityMax = Number(rangeMatch[2]);
    remaining = remaining.slice(rangeMatch[0].length).trim();
  } else {
    const quantityMatch = remaining.match(QUANTITY_PATTERN);
    if (quantityMatch) {
      quantity = Number(quantityMatch[1]);
      remaining = remaining.slice(quantityMatch[0].length).trim();
    }
  }

  let unit: string | undefined;
  let unitOriginal: string | undefined;
  const unitMatch = remaining.match(UNIT_PATTERN);
  if (unitMatch) {
    unitOriginal = unitMatch[1];
    unit = unitOriginal.toLowerCase();
    remaining = remaining.slice(unitMatch[0].length).trim();
  }

  return {
    raw,
    ingredient: remaining || raw,
    quantity,
    quantityMax,
    unit,
    unitOriginal,
    optional: false,
    confidence: 0.5,
  };
}

