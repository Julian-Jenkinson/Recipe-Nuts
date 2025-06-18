import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Recipe = {
  id: string; // Keep this, generate on add
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
};

type RecipeState = {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  getRecipeById: (id: string) => Recipe | undefined;
};

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [], // Start with empty array
      addRecipe: (recipe) => set((state) => ({ recipes: [...state.recipes, recipe] })),
      getRecipeById: (id) => get().recipes.find((r) => r.id === id),
    }),
    {
      name: 'recipe-storage', // key for AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
