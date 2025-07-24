import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import { RecipeForm } from '../../../components/RecipeForm';
import { Recipe, useRecipeStore } from '../../../stores/useRecipeStore';

export default function AddBlankRecipe() {
  const router = useRouter();
  const addRecipe = useRecipeStore((state) => state.addRecipe);

  const handleSubmit = (recipe: Recipe) => {
    try {
      // Generate a new ID for the recipe
      const newRecipe = {
        ...recipe,
        id: `recipe-${Date.now()}`,
        favourite: false,
      };

      addRecipe(newRecipe);
      Alert.alert('Success', 'Recipe created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating recipe:', error);
      Alert.alert('Error', 'Failed to create recipe. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <RecipeForm
      initialRecipe={{}}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      mode="create"
    />
  );
}