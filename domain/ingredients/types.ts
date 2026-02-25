export type IngredientDetail = {
  raw: string;
  ingredient?: string;
  quantity?: number;
  quantityMax?: number;
  unit?: string;
  unitOriginal?: string;
  preparation?: string;
  notes?: string;
  optional?: boolean;
  confidence?: number;
};

