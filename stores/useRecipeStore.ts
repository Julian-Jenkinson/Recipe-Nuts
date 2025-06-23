import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Recipe = {
  id: string; // local UUID
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  source: string;
  category: string;
  notes: string[];
  difficulty: string;
  cookTime: string;
  prepTime: string;
  servingSize: string;
  favourite: boolean;
};

type RecipeState = {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  deleteRecipe: (id: string) => void;
};

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],

      addRecipe: (recipe) =>
        set((state) => ({
          recipes: [...state.recipes, recipe],
        })),

      getRecipeById: (id) => get().recipes.find((r) => r.id === id),

      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
