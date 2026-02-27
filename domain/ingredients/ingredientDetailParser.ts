import type { IngredientDetail } from "./types";

const MIXED_FRACTION_PATTERN = /^(\d+)(?:\s+and)?\s+(\d+)\/(\d+)/i;
const FRACTION_PATTERN = /^(\d+)\/(\d+)/;
const DECIMAL_PATTERN = /^(\d*\.\d+|\d+)/;
const UNIT_PATTERN =
  /^(tsp|teaspoon|teaspoons|tbsp|tablespoon|tablespoons|ml|milliliter|milliliters|millilitre|millilitres|l|liter|liters|litre|litres|g|gram|grams|kg|kilogram|kilograms|oz|ounce|ounces|lb|lbs|pound|pounds|cup|cups|pinch|pinches|clove|cloves|can|cans)\b/i;

type ParsedQuantity = {
  value: number;
  token: string;
};

function normalizeUnitToken(token: string): string {
  const value = token.trim().toLowerCase();

  if (value === "teaspoon" || value === "teaspoons") return "tsp";
  if (value === "tablespoon" || value === "tablespoons") return "tbsp";
  if (
    value === "milliliter" ||
    value === "milliliters" ||
    value === "millilitre" ||
    value === "millilitres"
  ) {
    return "ml";
  }
  if (value === "liter" || value === "liters" || value === "litre" || value === "litres") {
    return "l";
  }
  if (value === "gram" || value === "grams") return "g";
  if (value === "kilogram" || value === "kilograms") return "kg";
  if (value === "ounce" || value === "ounces") return "oz";
  if (value === "lbs" || value === "pound" || value === "pounds") return "lb";
  if (value === "pinches") return "pinch";

  return value;
}

function parseLeadingQuantity(input: string): ParsedQuantity | undefined {
  const mixedMatch = input.match(MIXED_FRACTION_PATTERN);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);
    if (denominator > 0) {
      return {
        value: whole + numerator / denominator,
        token: mixedMatch[0],
      };
    }
  }

  const fractionMatch = input.match(FRACTION_PATTERN);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (denominator > 0) {
      return {
        value: numerator / denominator,
        token: fractionMatch[0],
      };
    }
  }

  const decimalMatch = input.match(DECIMAL_PATTERN);
  if (decimalMatch) {
    return {
      value: Number(decimalMatch[1]),
      token: decimalMatch[0],
    };
  }

  return undefined;
}

export function parseIngredientDetail(rawInput: string): IngredientDetail {
  const raw = String(rawInput ?? "").trim();
  if (!raw) {
    return { raw: "", ingredient: "" };
  }

  let remaining = raw;
  let quantity: number | undefined;
  let quantityMax: number | undefined;

  const quantityMatch = parseLeadingQuantity(remaining);
  if (quantityMatch) {
    quantity = quantityMatch.value;
    remaining = remaining.slice(quantityMatch.token.length).trimStart();

    if (remaining.startsWith("-")) {
      const afterDash = remaining.slice(1).trimStart();
      const quantityMaxMatch = parseLeadingQuantity(afterDash);
      if (quantityMaxMatch) {
        quantityMax = quantityMaxMatch.value;
        remaining = afterDash.slice(quantityMaxMatch.token.length).trimStart();
      }
    }
  }

  let unit: string | undefined;
  let unitOriginal: string | undefined;
  const unitMatch = remaining.match(UNIT_PATTERN);
  if (unitMatch) {
    unitOriginal = unitMatch[1];
    unit = normalizeUnitToken(unitOriginal);
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
