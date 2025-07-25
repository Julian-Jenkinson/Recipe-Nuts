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
  isPro: boolean;             // ✅ NEW → Pro user flag
  purchaseDate: string | null; // ✅ NEW → When they upgraded (if any)
  setPro: (value: boolean) => void; // add setter

  addRecipe: (recipe: Recipe) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  deleteRecipe: (id: string) => void;
  toggleFavourite: (id: string) => void;
  updateRecipe: (updatedRecipe: Recipe) => void;

  upgradeToPro: () => void;    // ✅ NEW → Action to simulate upgrade
};

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      isPro: false,            // ✅ default = free user
      purchaseDate: null,      // ✅ no purchase initially

      addRecipe: (recipe) =>
        set((state) => ({
          recipes: [...state.recipes, recipe],
        })),

      getRecipeById: (id) => get().recipes.find((r) => r.id === id),

      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        })),

      toggleFavourite: (id: string) =>
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === id ? { ...r, favourite: !r.favourite } : r
          ),
        })),

      updateRecipe: (updatedRecipe) =>
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === updatedRecipe.id ? updatedRecipe : r
          ),
        })),

      // ✅ Upgrade to Pro simulation
      upgradeToPro: () =>
        set(() => ({
          isPro: true,
          purchaseDate: new Date().toISOString(),
        })),
      
      // Add this setter function:
      setPro: (value: boolean) => set({ isPro: value }),
      
    }),

    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
