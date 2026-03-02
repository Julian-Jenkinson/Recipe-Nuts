import type { IngredientDetail } from "./types";

export type UnitSystem = "imperial" | "metric";

type IngredientCompatibleRecipe = {
  ingredients?: unknown;
  ingredientDetails?: unknown;
};

export type DisplayIngredientRow = {
  mode: "structured" | "legacy";
  rawText: string;
  quantityText?: string;
  unitText?: string;
  ingredientText?: string;
  noteText?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIngredientDetail(value: unknown): value is IngredientDetail {
  return (
    isObject(value) &&
    (typeof value.raw === "string" || typeof value.ingredient === "string")
  );
}

function toDisplayString(detail: IngredientDetail): string {
  if (typeof detail.raw === "string" && detail.raw.trim().length > 0) {
    return detail.raw.trim();
  }
  if (typeof detail.ingredient === "string" && detail.ingredient.trim().length > 0) {
    return detail.ingredient.trim();
  }
  return "";
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function formatQuantityValue(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const sign = value < 0 ? "-" : "";
  const absValue = Math.abs(value);
  const roundedEighths = Math.round(absValue * 8);
  const whole = Math.floor(roundedEighths / 8);
  const remainder = roundedEighths % 8;

  if (remainder === 0) {
    return `${sign}${whole}`;
  }

  const divisor = gcd(remainder, 8);
  const numerator = remainder / divisor;
  const denominator = 8 / divisor;

  if (whole > 0) {
    return `${sign}${whole} ${numerator}/${denominator}`;
  }

  return `${sign}${numerator}/${denominator}`;
}

function formatQuantity(
  quantity: number | undefined,
  quantityMax: number | undefined
): string | undefined {
  if (typeof quantity !== "number" || Number.isNaN(quantity)) {
    return undefined;
  }
  if (typeof quantityMax === "number" && !Number.isNaN(quantityMax)) {
    return `${formatQuantityValue(quantity)}-${formatQuantityValue(quantityMax)}`;
  }
  return formatQuantityValue(quantity);
}

function formatDecimalValue(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Number(value.toFixed(decimals));
  if (Math.abs(rounded - Math.round(rounded)) < 0.0001) {
    return String(Math.round(rounded));
  }
  return rounded.toString();
}

function formatDecimalQuantity(
  quantity: number | undefined,
  quantityMax: number | undefined,
  decimals = 2
): string | undefined {
  if (typeof quantity !== "number" || Number.isNaN(quantity)) {
    return undefined;
  }

  if (typeof quantityMax === "number" && !Number.isNaN(quantityMax)) {
    return `${formatDecimalValue(quantity, decimals)}-${formatDecimalValue(quantityMax, decimals)}`;
  }

  return formatDecimalValue(quantity, decimals);
}

function normalizeUnit(detail: IngredientDetail): string | undefined {
  const fromUnit =
    typeof detail.unit === "string" && detail.unit.trim().length > 0
      ? detail.unit.trim().toLowerCase()
      : undefined;
  if (fromUnit) return fromUnit;

  if (typeof detail.unitOriginal === "string" && detail.unitOriginal.trim().length > 0) {
    return detail.unitOriginal.trim().toLowerCase();
  }

  return undefined;
}

type ConvertedQuantity = {
  quantity: number;
  quantityMax?: number;
  unitText: string;
};

const KITCHEN_CONVERSIONS = {
  tspToMl: 5,
  tbspToMl: 15,
  cupToMl: 240,
  ozToG: 28,
  lbToG: 454,
} as const;

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function roundSpoonValue(value: number): number {
  const step = Math.abs(value) < 1 ? 1 / 8 : 1 / 4;
  return roundToStep(value, step);
}

function roundCupValue(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const absolute = Math.abs(value);
  const whole = Math.floor(absolute);
  const fractional = absolute - whole;
  const allowed = [0, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1];

  let closest = allowed[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of allowed) {
    const distance = Math.abs(fractional - candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      closest = candidate;
    }
  }

  if (closest === 1) {
    return sign * (whole + 1);
  }
  return sign * (whole + closest);
}

function roundForConvertedUnit(value: number | undefined, unitText: string): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  const unit = unitText.trim().toLowerCase();

  if (unit === "ml" || unit === "g") {
    const sign = value < 0 ? -1 : 1;
    const absolute = Math.abs(value);
    const step = absolute >= 100 ? 5 : 1;
    let rounded = roundToStep(absolute, step);
    if (absolute > 0 && rounded === 0) {
      rounded = 1;
    }
    return sign * rounded;
  }

  if (unit === "tsp" || unit === "tbsp") {
    return roundSpoonValue(value);
  }

  if (unit === "cup" || unit === "cups") {
    return roundCupValue(value);
  }

  return value;
}

function formatCupValue(value: number): string {
  const rounded = roundCupValue(value);
  const sign = rounded < 0 ? "-" : "";
  const absolute = Math.abs(rounded);
  const whole = Math.floor(absolute + 1e-9);
  const fractional = absolute - whole;

  const epsilon = 0.01;
  if (fractional < epsilon) {
    return `${sign}${whole}`;
  }

  const candidates: Array<{ value: number; text: string }> = [
    { value: 1 / 4, text: "1/4" },
    { value: 1 / 3, text: "1/3" },
    { value: 1 / 2, text: "1/2" },
    { value: 2 / 3, text: "2/3" },
    { value: 3 / 4, text: "3/4" },
  ];

  const match = candidates.find((candidate) => Math.abs(fractional - candidate.value) < epsilon);
  if (!match) {
    return `${sign}${whole}`;
  }

  if (whole > 0) {
    return `${sign}${whole} ${match.text}`;
  }

  return `${sign}${match.text}`;
}

function formatQuantityForUnit(
  quantity: number | undefined,
  quantityMax: number | undefined,
  unitText: string | undefined
): string | undefined {
  const normalizedUnit = unitText?.trim().toLowerCase();
  if (normalizedUnit === "ml" || normalizedUnit === "g") {
    return formatDecimalQuantity(
      roundForConvertedUnit(quantity, normalizedUnit),
      roundForConvertedUnit(quantityMax, normalizedUnit),
      0
    );
  }
  if (normalizedUnit === "l" || normalizedUnit === "kg") {
    return formatDecimalQuantity(quantity, quantityMax, 2);
  }
  if (normalizedUnit === "tsp" || normalizedUnit === "tbsp") {
    return formatQuantity(
      roundForConvertedUnit(quantity, normalizedUnit),
      roundForConvertedUnit(quantityMax, normalizedUnit)
    );
  }
  if (normalizedUnit === "cup" || normalizedUnit === "cups") {
    if (typeof quantity !== "number" || Number.isNaN(quantity)) {
      return undefined;
    }
    if (typeof quantityMax === "number" && !Number.isNaN(quantityMax)) {
      return `${formatCupValue(quantity)}-${formatCupValue(quantityMax)}`;
    }
    return formatCupValue(quantity);
  }

  return formatQuantity(quantity, quantityMax);
}

function convertUsingFactor(
  quantity: number,
  quantityMax: number | undefined,
  factor: number,
  unitText: string
): ConvertedQuantity {
  return {
    quantity: quantity * factor,
    quantityMax:
      typeof quantityMax === "number" && !Number.isNaN(quantityMax)
        ? quantityMax * factor
        : undefined,
    unitText,
  };
}

function convertVolumeToImperial(
  quantity: number,
  quantityMax: number | undefined,
  fromUnit: "ml" | "l"
): ConvertedQuantity {
  const quantityMl = fromUnit === "l" ? quantity * 1000 : quantity;
  const quantityMaxMl =
    typeof quantityMax === "number" && !Number.isNaN(quantityMax)
      ? fromUnit === "l"
        ? quantityMax * 1000
        : quantityMax
      : undefined;

  if (quantityMl >= KITCHEN_CONVERSIONS.cupToMl) {
    return convertUsingFactor(quantityMl, quantityMaxMl, 1 / KITCHEN_CONVERSIONS.cupToMl, "cups");
  }
  if (quantityMl >= KITCHEN_CONVERSIONS.tbspToMl) {
    return convertUsingFactor(quantityMl, quantityMaxMl, 1 / KITCHEN_CONVERSIONS.tbspToMl, "tbsp");
  }
  return convertUsingFactor(quantityMl, quantityMaxMl, 1 / KITCHEN_CONVERSIONS.tspToMl, "tsp");
}

function convertWeightToImperial(
  quantity: number,
  quantityMax: number | undefined,
  fromUnit: "g" | "kg"
): ConvertedQuantity {
  const quantityG = fromUnit === "kg" ? quantity * 1000 : quantity;
  const quantityMaxG =
    typeof quantityMax === "number" && !Number.isNaN(quantityMax)
      ? fromUnit === "kg"
        ? quantityMax * 1000
        : quantityMax
      : undefined;

  if (quantityG >= KITCHEN_CONVERSIONS.lbToG) {
    return convertUsingFactor(quantityG, quantityMaxG, 1 / KITCHEN_CONVERSIONS.lbToG, "lb");
  }
  return convertUsingFactor(quantityG, quantityMaxG, 1 / KITCHEN_CONVERSIONS.ozToG, "oz");
}

function maybeConvertQuantity(
  detail: IngredientDetail,
  unitSystem: UnitSystem | undefined
): ConvertedQuantity | undefined {
  if (!unitSystem) return undefined;
  if (typeof detail.quantity !== "number" || Number.isNaN(detail.quantity)) {
    return undefined;
  }

  const unit = normalizeUnit(detail);
  if (!unit) return undefined;

  if (unitSystem === "metric") {
    if (unit === "tsp") {
      return convertUsingFactor(detail.quantity, detail.quantityMax, KITCHEN_CONVERSIONS.tspToMl, "ml");
    }
    if (unit === "tbsp") {
      return convertUsingFactor(detail.quantity, detail.quantityMax, KITCHEN_CONVERSIONS.tbspToMl, "ml");
    }
    if (unit === "cup" || unit === "cups") {
      return convertUsingFactor(detail.quantity, detail.quantityMax, KITCHEN_CONVERSIONS.cupToMl, "ml");
    }
    if (unit === "ml") return convertUsingFactor(detail.quantity, detail.quantityMax, 1, "ml");
    if (unit === "l") return convertUsingFactor(detail.quantity, detail.quantityMax, 1000, "ml");
    if (unit === "oz") return convertUsingFactor(detail.quantity, detail.quantityMax, KITCHEN_CONVERSIONS.ozToG, "g");
    if (unit === "lb") return convertUsingFactor(detail.quantity, detail.quantityMax, KITCHEN_CONVERSIONS.lbToG, "g");
    if (unit === "g") return convertUsingFactor(detail.quantity, detail.quantityMax, 1, "g");
    if (unit === "kg") return convertUsingFactor(detail.quantity, detail.quantityMax, 1000, "g");
    return undefined;
  }

  if (unit === "ml" || unit === "l") {
    return convertVolumeToImperial(detail.quantity, detail.quantityMax, unit);
  }
  if (unit === "g" || unit === "kg") {
    return convertWeightToImperial(detail.quantity, detail.quantityMax, unit);
  }
  return undefined;
}

function toDisplayRow(
  detail: IngredientDetail,
  unitSystem: UnitSystem | undefined,
  scaleFactor: number
): DisplayIngredientRow {
  const safeScaleFactor =
    Number.isFinite(scaleFactor) && scaleFactor > 0 ? scaleFactor : 1;
  const scaledQuantity =
    typeof detail.quantity === "number" && !Number.isNaN(detail.quantity)
      ? detail.quantity * safeScaleFactor
      : detail.quantity;
  const scaledQuantityMax =
    typeof detail.quantityMax === "number" && !Number.isNaN(detail.quantityMax)
      ? detail.quantityMax * safeScaleFactor
      : detail.quantityMax;
  const scaledDetail: IngredientDetail = {
    ...detail,
    quantity: scaledQuantity,
    quantityMax: scaledQuantityMax,
  };

  const converted = maybeConvertQuantity(scaledDetail, unitSystem);
  const unitText = converted?.unitText
    ? converted.unitText
    : typeof scaledDetail.unit === "string" && scaledDetail.unit.trim().length > 0
    ? scaledDetail.unit.trim()
    : typeof scaledDetail.unitOriginal === "string" && scaledDetail.unitOriginal.trim().length > 0
    ? scaledDetail.unitOriginal.trim()
    : undefined;
  const roundedConvertedQuantity = converted?.unitText
    ? roundForConvertedUnit(converted.quantity, converted.unitText)
    : undefined;
  const roundedConvertedQuantityMax = converted?.unitText
    ? roundForConvertedUnit(converted.quantityMax, converted.unitText)
    : undefined;
  const quantityText = formatQuantityForUnit(
    roundedConvertedQuantity ?? converted?.quantity ?? scaledDetail.quantity,
    roundedConvertedQuantityMax ?? converted?.quantityMax ?? scaledDetail.quantityMax,
    unitText
  );
  const ingredientText =
    typeof scaledDetail.ingredient === "string" && scaledDetail.ingredient.trim().length > 0
      ? scaledDetail.ingredient.trim()
      : undefined;
  const noteText =
    typeof scaledDetail.notes === "string" && scaledDetail.notes.trim().length > 0
      ? scaledDetail.notes.trim()
      : undefined;
  const rawText = toDisplayString(scaledDetail);

  if (quantityText || unitText || ingredientText) {
    return {
      mode: "structured",
      rawText,
      quantityText,
      unitText,
      ingredientText,
      noteText,
    };
  }

  return {
    mode: "legacy",
    rawText,
  };
}

export function getDisplayIngredientRows(
  recipe: IngredientCompatibleRecipe | null | undefined,
  unitSystem?: UnitSystem,
  scaleFactor = 1
): DisplayIngredientRow[] {
  if (!recipe) return [];

  if (Array.isArray(recipe.ingredientDetails)) {
    const fromDetails = recipe.ingredientDetails
      .filter(isIngredientDetail)
      .map((detail) => toDisplayRow(detail, unitSystem, scaleFactor))
      .filter((row) => row.rawText.length > 0);

    if (fromDetails.length > 0) {
      return fromDetails;
    }
  }

  if (Array.isArray(recipe.ingredients)) {
    return recipe.ingredients
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((rawText) => ({ mode: "legacy" as const, rawText }));
  }

  return [];
}

export function getDisplayIngredients(
  recipe: IngredientCompatibleRecipe | null | undefined,
  unitSystem?: UnitSystem,
  scaleFactor = 1
): string[] {
  return getDisplayIngredientRows(recipe, unitSystem, scaleFactor).map((row) => row.rawText);
}
