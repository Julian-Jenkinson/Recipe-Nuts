import { Feather, Ionicons } from '@expo/vector-icons';
import { Box, HStack, Input, InputField, InputSlot, Pressable, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddRecipeButton from '../components/AddRecipeButton';
import { useRecipeStore } from '../stores/useRecipeStore';
import RecipeCard from './RecipeCard';


export default function RecipeListScreen() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);
  const [searchQuery, setSearchQuery] = React.useState('');


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

  const query = searchQuery.trim().toLowerCase();

const isFavQuery =
  query === 'fav' ||
  query === 'favo' ||
  query === 'favou' ||
  query === 'favour' ||
  query === 'favouri' ||
  query === 'favourit' ||
  query === 'favourite' || 
  query === 'favorite';

const filteredRecipes = recipes.filter((recipe) => {
  // Special case: user is searching for favourites
  if (isFavQuery) {
    return recipe.favourite;
  }

  return (
    (recipe.title || '').toLowerCase().includes(query) ||
    (recipe.source || '').toLowerCase().includes(query) ||
    (recipe.category || '').toLowerCase().includes(query)
  );
});


  const displayRecipes: DisplayRecipe[] = [
    { id: 'add', type: 'add' },
    ...filteredRecipes,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F1A733' }}>
      <View style={{ flex: 1, backgroundColor: '#F1A733' }}>
        <Box
          borderTopLeftRadius={25}
          borderTopRightRadius={25}
          pt={45}
          mt={40}
          bg="$backgroundLight100"
          flex={1}
        >
          <Input 
            variant="outline" 
            size="sm" 
            borderColor="#555" 
            borderRadius="$xl" 
            mx={16}>
          <InputSlot pl={10}>
              <Ionicons name="search" size={20} color="#555"/>
          </InputSlot>  
          <InputField
            placeholder="Search"
            fontSize={16}
            style={{ fontFamily: 'Nunito-500' }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <InputSlot pr={10}>
              <Pressable onPress={() => setSearchQuery('')}>
                <Feather name="x" size={20} color="#888" />
              </Pressable>
            </InputSlot>
          )}
          </Input>

          <HStack px={16} pt={30} pb={6} justifyContent="space-between" alignItems="center">
            <Text fontSize= {24} color="#333" style={{ fontFamily: 'Nunito-800' }}>
              Recipes
            </Text>
            <Pressable onPress={() => console.log('Open sort & filters')}>
              <HStack alignItems="center" space="sm">
                <Text fontSize={18} style={{ fontFamily: 'Nunito-700' }} color="#333">
                  Sort by
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
                    onToggleFavourite={() => {
                      useRecipeStore.getState().toggleFavourite(item.id); // See below
                    }}
                  />
                )}
              </Box>
            )}
          />
        </Box>
      </View>
    </SafeAreaView>
  );
}
