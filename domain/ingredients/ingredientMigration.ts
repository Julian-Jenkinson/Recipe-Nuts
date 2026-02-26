import type { IngredientDetail } from "./types";
import { parseIngredientDetail } from "./ingredientDetailParser";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIngredientDetail(value: unknown): value is IngredientDetail {
  if (!isObject(value)) return false;
  return typeof value.raw === "string" || typeof value.ingredient === "string";
}

function ensureRawField(value: IngredientDetail): IngredientDetail {
  if (typeof value.raw === "string") return value;
  if (typeof value.ingredient === "string" && value.ingredient.trim().length > 0) {
    return { ...value, raw: value.ingredient };
  }
  return { ...value, raw: "" };
}

function shouldRepairFromRaw(value: IngredientDetail): boolean {
  if (typeof value.raw !== "string" || value.raw.trim().length === 0) {
    return false;
  }

  if (typeof value.ingredient === "string") {
    const ingredientText = value.ingredient.trim().toLowerCase();
    if (ingredientText.startsWith("/") || ingredientText.startsWith("and ")) {
      return true;
    }
  }

  const hasStructuredFields =
    typeof value.quantity === "number" ||
    typeof value.quantityMax === "number" ||
    (typeof value.unit === "string" && value.unit.trim().length > 0) ||
    (typeof value.unitOriginal === "string" && value.unitOriginal.trim().length > 0);

  return !hasStructuredFields;
}

function repairFromRaw(value: IngredientDetail): IngredientDetail {
  const parsed = parseIngredientDetail(value.raw);
  return {
    ...value,
    ingredient: parsed.ingredient,
    quantity: parsed.quantity,
    quantityMax: parsed.quantityMax,
    unit: parsed.unit,
    unitOriginal: parsed.unitOriginal,
  };
}

export function migrateLegacyIngredientItem(item: unknown): IngredientDetail {
  if (typeof item === "string") {
    return parseIngredientDetail(item);
  }

  if (isIngredientDetail(item)) {
    const normalized = ensureRawField(item);
    if (shouldRepairFromRaw(normalized)) {
      return repairFromRaw(normalized);
    }
    return normalized;
  }

  return parseIngredientDetail(String(item ?? ""));
}

export function migrateLegacyIngredientsToDetails(
  items: readonly unknown[]
): IngredientDetail[] {
  return items.map(migrateLegacyIngredientItem);
}
