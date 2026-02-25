import type { IngredientDetail } from "./types";

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

function formatQuantity(detail: IngredientDetail): string | undefined {
  if (typeof detail.quantity !== "number" || Number.isNaN(detail.quantity)) {
    return undefined;
  }
  if (typeof detail.quantityMax === "number" && !Number.isNaN(detail.quantityMax)) {
    return `${detail.quantity}-${detail.quantityMax}`;
  }
  return String(detail.quantity);
}

function toDisplayRow(detail: IngredientDetail): DisplayIngredientRow {
  const quantityText = formatQuantity(detail);
  const unitText =
    typeof detail.unitOriginal === "string" && detail.unitOriginal.trim().length > 0
      ? detail.unitOriginal.trim()
      : typeof detail.unit === "string" && detail.unit.trim().length > 0
      ? detail.unit.trim()
      : undefined;
  const ingredientText =
    typeof detail.ingredient === "string" && detail.ingredient.trim().length > 0
      ? detail.ingredient.trim()
      : undefined;
  const noteText =
    typeof detail.notes === "string" && detail.notes.trim().length > 0
      ? detail.notes.trim()
      : undefined;
  const rawText = toDisplayString(detail);

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
  recipe: IngredientCompatibleRecipe | null | undefined
): DisplayIngredientRow[] {
  if (!recipe) return [];

  if (Array.isArray(recipe.ingredientDetails)) {
    const fromDetails = recipe.ingredientDetails
      .filter(isIngredientDetail)
      .map(toDisplayRow)
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
  recipe: IngredientCompatibleRecipe | null | undefined
): string[] {
  return getDisplayIngredientRows(recipe).map((row) => row.rawText);
}
