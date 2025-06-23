import { Ionicons } from '@expo/vector-icons';
import { Box, HStack, Input, InputField, InputIcon, InputSlot, Pressable, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, View } from 'react-native';
import AddRecipeButton from '../components/AddRecipeButton';
import { useRecipeStore } from '../stores/useRecipeStore';
import RecipeCard from './RecipeCard';


export default function RecipeListScreen() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);

  // Updated Recipe type with new fields
  type Recipe = {
    id: string;
    title: string;
    imageUrl: string;
    source: string;
    prepTime: string;
    cookTime: string;
    difficulty: string;
    servingSize: string;
    notes: string[];
    category: string;
    favourite: boolean;
  };

  type DisplayRecipe =
    | { id: 'add'; type: 'add' }
    | Recipe;

  const isAddItem = (item: DisplayRecipe): item is { id: 'add'; type: 'add' } => {
    return 'type' in item && item.type === 'add';
  };

  const displayRecipes: DisplayRecipe[] = [
    { id: 'add', type: 'add' },
    ...recipes,
  ];

  const handlePress = (id: string) => {
    router.push(`/recipes/${id}`);
  };

  const handleAddRecipe = () => {
    router.push('/add-recipe');
  };

  const handleAddFromUrl = () => {
    router.push('/AddRecipeFromUrl');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A192F' }}>
      
      <Box
        borderTopLeftRadius={25}
        borderTopRightRadius={25}
        pt={45}
        bg="$backgroundLight100"
        flex={1}
      >
        <Input variant="outline" size="md" borderColor="#666" borderRadius="$xl" mx={16}>
        <InputSlot>
          <InputIcon as={Ionicons} name="search" size="xl" color="#666" ml="$2" />
        </InputSlot>  
          <InputField placeholder="Search" fontSize={18} fontWeight={500} />
        </Input>

        <HStack px={16} pt={30} pb={6} justifyContent="space-between" alignItems="center">
          <Text fontSize={24} fontWeight="$bold" color='#444'>
            Recipes
          </Text>
          <Pressable onPress={() => console.log('Open sort & filters')}>
            <HStack alignItems="center" space="sm">
              <Text fontSize={18} fontWeight="700" color="#444">
                Sort & Filters
              </Text>
              <Ionicons name="options" size={22} color="#333" />
            </HStack>
          </Pressable>
        </HStack>

        <FlatList
          data={displayRecipes}
          numColumns={3}
          keyExtractor={(item, index) => item.id ?? `special-${index}`}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: 'flex-start' }}
          renderItem={({ item, index }) => (
            <Box
              key={item.id}
              style={{
                width: '31.5%',
                marginRight: (index + 1) % 3 === 0 ? 0 : '2.75%',
                marginBottom: 16,
              }}
            >
              {isAddItem(item) ? (
                <AddRecipeButton onPress={handleAddFromUrl} /> // can also call handleAddRecipe to test
              ) : (
                <RecipeCard
                  id={item.id}
                  title={item.title}
                  imageUrl={item.imageUrl}
                  source={item.source} // pass source for display
                  prepTime={item.prepTime} // pass if you want to show later
                  cookTime={item.cookTime}
                  difficulty={item.difficulty}
                  servingSize={item.servingSize}
                  notes={item.notes}
                  category={item.category}
                  favourite={item.favourite}
                  onPress={() => handlePress(item.id)}
                />
              )}
            </Box>
          )}
        />
      </Box>
    </View>
  );
}
