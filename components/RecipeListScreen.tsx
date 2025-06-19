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

  const handleAddFromUrl = () => {
    router.push('/AddRecipeFromUrl'); // Navigate to your URL input screen
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Buttons at the top */}
      <Box padding={16} bg="$backgroundLight300" borderBottomWidth={1} borderColor="$borderLight300">
        <Pressable onPress={handleAddRecipe} style={{ marginBottom: 8 }}>
          <Text>Add Recipe</Text>
        </Pressable>

        <Pressable onPress={handleAddFromUrl}>
          <Text>Add From URL</Text>
        </Pressable>
      </Box>

      <FlatList
        data={recipes}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'flex-start' }}
        renderItem={({ item, index }) => (
    <Box
      style={{
        width: '30%',            // slightly less than 1/3 to fit margin
        marginRight: (index + 1) % 3 === 0 ? 0 : '5%',  // no right margin on last item in row
        marginBottom: 16,
      }}
    
    >
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
