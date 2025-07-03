import { Feather, Ionicons } from '@expo/vector-icons';
import { Box, HStack, Input, InputField, InputSlot, Pressable, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HorizontalScroll, { FiltersType } from '../../../components/HorizontalScroll';
import RecipeCard from '../../../components/RecipeCard';
import { useRecipeStore } from '../../../stores/useRecipeStore';

export default function RecipeListScreen() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);
  const [searchQuery, setSearchQuery] = React.useState('');

  const [filters, setFilters] = React.useState<FiltersType>({
    category: [] as string[],
    favourites: false,
  });

  const setHorizontalFilters = React.useCallback((value: React.SetStateAction<FiltersType>) => {
    setFilters(value);
  }, []);

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
    if (isFavQuery) return recipe.favourite;

    const matchesSearch =
      (recipe.title || '').toLowerCase().includes(query) ||
      (recipe.source || '').toLowerCase().includes(query) ||
      (recipe.category || '').toLowerCase().includes(query);

    const matchesCategory = filters.category.length === 0 || filters.category.includes(recipe.category);
    const matchesFavourites = !filters.favourites || recipe.favourite;

    return matchesSearch && matchesCategory && matchesFavourites;
  });

  const handlePress = (id: string) => {
    router.push(`/recipes/${id}`);
  };


  return (
    <SafeAreaView style={{ flex: 1 }}> 
      
      <View style={{ flex: 1 }}>
        <HStack px={16} pt={40} pb={6} justifyContent="space-between" alignItems="center">
          <Text fontSize={24} color="#333" style={{ fontFamily: 'Nunito-800' }}>
            Explore Recipes
          </Text>
        </HStack>

        <HStack px={16} pt={6} justifyContent="space-between" alignItems="center">
          <Text fontSize={18} color="#666" style={{ fontFamily: 'Nunito-600' }}>
            <Text>{`${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}`}</Text> 
          </Text>
        </HStack>
        
        <Box mt={25} flex={1}>
          <Input 
            variant="rounded" 
            size="sm" 
            borderWidth={0}
            borderColor="transparent"
            borderStyle="none"
            borderRadius="$3xl" 
            backgroundColor='#e3e3e3'
            mx={16}
          >
            <InputSlot pl={10}>
              <Ionicons name="search" size={20} color="#555"/>
            </InputSlot>  
            <InputField
              placeholder="Search"
              fontSize={16}
              style={{ fontFamily: 'Nunito-600' }}
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

          <HorizontalScroll 
            filters={filters}
            setFilters={setHorizontalFilters}
          />

          <FlatList
            data={filteredRecipes}
            numColumns={3}
            keyExtractor={(item) => item.id}
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
                <RecipeCard
                  id={item.id}
                  title={item.title}
                  imageUrl={item.imageUrl}
                  source={item.source}
                  prepTime={item.prepTime}
                  cookTime={item.cookTime}
                  difficulty={item.difficulty}
                  servingSize={item.servingSize}
                  notes={item.notes}
                  category={item.category}
                  favourite={item.favourite}
                  onPress={() => handlePress(item.id)}
                  onToggleFavourite={() => {
                    useRecipeStore.getState().toggleFavourite(item.id);
                  }}
                />
              </Box>
            )}
          />
        </Box>
      </View>
    </SafeAreaView>
  );
}
