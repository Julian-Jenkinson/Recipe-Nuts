import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { CustomerInfo } from 'react-native-purchases';
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
  isPro: boolean;             // ✅ Pro user flag
  purchaseDate: string | null; 
  customerInfo: CustomerInfo | null;

  setPro: (value: boolean) => void;

  addRecipe: (recipe: Recipe) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  deleteRecipe: (id: string) => void;
  toggleFavourite: (id: string) => void;
  updateRecipe: (updatedRecipe: Recipe) => void;

  upgradeToPro: () => void;

  // RevenueCat actions
  setCustomerInfo: (info: CustomerInfo | null) => void;
  restorePurchases: () => Promise<void>;
  syncCustomerInfo: () => Promise<void>;
};

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      isPro: false,
      purchaseDate: null,
      customerInfo: null,

      addRecipe: (recipe) =>
        set((state) => ({ recipes: [...state.recipes, recipe] })),

      getRecipeById: (id) => get().recipes.find((r) => r.id === id),

      deleteRecipe: (id) =>
        set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) })),

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

      upgradeToPro: () =>
        set(() => ({
          isPro: true,
          purchaseDate: new Date().toISOString(),
        })),

      setPro: (value: boolean) => set({ isPro: value }),

      // RevenueCat helpers
      setCustomerInfo: (info) =>
        set({
          customerInfo: info,
          isPro: !!info?.entitlements.active["pro"],
        }),

      restorePurchases: async () => {
        try {
          const info = await Purchases.restorePurchases();
          get().setCustomerInfo(info);
        } catch (err) {
          console.warn("⚠️ Failed to restore purchases:", err);
        }
      },

      syncCustomerInfo: async () => {
        try {
          const info = await Purchases.getCustomerInfo();
          get().setCustomerInfo(info);
        } catch (err) {
          console.warn("⚠️ Failed to sync customer info:", err);
        }
      },
    }),
    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
