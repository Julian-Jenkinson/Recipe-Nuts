import { Box } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRecipeStore } from '../stores/useRecipeStore';
import RecipeCard from './RecipeCard';

export default function RecipeListScreen() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);

  const handlePress = (id: string) => {
    router.push(`/recipes/${id}`);
  };

  const handleAddRecipe = () => {
    router.push('/add-recipe'); // Adjust path if different
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Add Recipe Button at the top */}
      <Box padding={16} bg="$backgroundLight300" borderBottomWidth={1} borderColor="$borderLight300">
        <Pressable onPress={handleAddRecipe}>
          <Text>Add Recipe</Text>
        </Pressable>
      </Box>
      

      <FlatList
        data={recipes}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <Box width="32%" overflow="hidden">
            <RecipeCard
              id={item.id}
              title={item.title}
              imageUrl={item.imageUrl}
              onPress={() => handlePress(item.id)}
            />
          </Box>
        )}
      />
    </View>
  );
}
