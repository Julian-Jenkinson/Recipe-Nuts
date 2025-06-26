import { Feather, Ionicons } from '@expo/vector-icons';
import { Box, HStack, Input, InputField, InputSlot, Pressable, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddRecipeButton from '../components/AddRecipeButton';
import FilterDrawer from '../components/FilterDrawer'; // fixed import typo here
import { useRecipeStore } from '../stores/useRecipeStore';
import RecipeCard from './RecipeCard';

export default function RecipeListScreen() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);  // drawer open state

  const [filters, setFilters] = React.useState({
    sortBy: '', // 'Newest', 'Oldest', etc.
    category: '', // 'Breakfast', 'Main', etc.
    difficulty: '', // 'Easy', 'Medium', etc.
    maxCookTime: 240, // slider value
    favourites: false,
  });

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

  const filteredRecipes = recipes
  .filter((recipe) => {
    if (isFavQuery) return recipe.favourite;
    

    const matchesSearch =
      (recipe.title || '').toLowerCase().includes(query) ||
      (recipe.source || '').toLowerCase().includes(query) ||
      (recipe.category || '').toLowerCase().includes(query);

    const matchesCategory = !filters.category || recipe.category === filters.category;
    const matchesDifficulty = !filters.difficulty || recipe.difficulty === filters.difficulty;
    const totalTime = (parseInt(recipe.prepTime || '0') + parseInt(recipe.cookTime || '0'));
    const matchesCookTime = filters.maxCookTime >= 240 
      ? true  // 240 means no upper limit, show all
      : totalTime <= filters.maxCookTime;

    const matchesFavourites = !filters.favourites || recipe.favourite;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesCookTime && matchesFavourites;
  })
  .sort((a, b) => {
    switch (filters.sortBy) {
      case 'Recent':
        return b.id.localeCompare(a.id);
      case 'Alphabetical':
        return a.title.localeCompare(b.title);
      case 'Prep Time':
        return parseInt(a.prepTime || '0') - parseInt(b.prepTime || '0');
      default:
        return 0;
    }
  });
  
  // Calculate active filters count
  const activeFiltersCount = [
    filters.sortBy,
    filters.category,
    filters.difficulty,
    ].filter((f) => f && f.length > 0).length + (filters.maxCookTime < 240 ? 1 : 0);


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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#242c3d' }}> 
      <View style={{ flex: 1, backgroundColor: '#242c3d' }}>
        
        <Box
          alignSelf="flex-end"
          bg="#3A4255"
          borderRadius={8}
          px={8} py={6} mt={16} mr={16}
        >
          <HStack space='sm' alignItems="center">
            <Feather name="book" size={18} color="#eee" />
            <Text color="#eee" fontSize={18} fontFamily="Nunito-600">
              {recipes.length}
            </Text>
          </HStack>
        </Box>
        
        <Box
          borderTopLeftRadius={25}
          borderTopRightRadius={25}
          pt={45}
          mt={25}
          bg="$backgroundLight100"
          flex={1}
        >
          <Input 
            variant="outline" 
            size="sm" 
            borderColor="#555" 
            borderRadius="$xl" 
            mx={16}
          >
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
            <Text fontSize={24} color="#333" style={{ fontFamily: 'Nunito-800' }}>
              Recipes
            </Text>
            <Pressable onPress={() => setIsFilterDrawerOpen(true)}>
              <HStack alignItems="center" space="sm">
                <Text fontSize={18} style={{ fontFamily: 'Nunito-700' }} color="#333">
                  Sort & Filters
                </Text>
                <Ionicons name="options" size={22} color="#333" />
              </HStack>
            </Pressable>
          </HStack>

          <HStack justifyContent="space-between" px={16} mb={8} alignItems="center">
            <Text fontSize={17} style={{ fontFamily: 'Nunito-600' }} color="#666">
              {activeFiltersCount} Filter{activeFiltersCount !== 1 ? 's' : ''} selected
            </Text>
            <Pressable
              onPress={() => setFilters({
                sortBy: '',
                category: '',
                difficulty: '',
                maxCookTime: 240,
                favourites: false
              })}
              style={{ paddingVertical: 3 }}
            >
              <Text fontSize={18} style={{ fontFamily: 'Nunito-700' }} color="#007AFF">
                Reset
              </Text>
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
                  <AddRecipeButton onPress={handleAddFromUrl} />
                ) : (
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
                )}
              </Box>
            )}
          />
        </Box>
      </View>

      {/* Filter Drawer component */}
      <FilterDrawer 
        open={isFilterDrawerOpen} 
        onClose={() => setIsFilterDrawerOpen(false)} 
        filters={filters}
        setFilters={setFilters}
      />
    </SafeAreaView>
  );
}
