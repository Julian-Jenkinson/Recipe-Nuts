import { Feather, Ionicons } from '@expo/vector-icons';
import { Box, HStack, Input, InputField, InputSlot, Pressable, Text, View } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HorizontalScroll, { FiltersType } from '../../../components/HorizontalScroll';
import RecipeCard from '../../../components/RecipeCard';
import { useRecipeStore } from '../../../stores/useRecipeStore';
import theme from '../../../theme';


export default function RecipeListScreen() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [focused, setFocused ] = React.useState(false);


  const [filters, setFilters] = React.useState<FiltersType>({
    mode: 'all',
  });

  const setHorizontalFilters = React.useCallback((value: React.SetStateAction<FiltersType>) => {
    setFilters(value);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  // Function to convert cook time to int
  function toMinutes(timeString?: string): number {
    if (!timeString) return 0;
    const match = timeString.match(/\d+/); // extract first number
    return match ? parseInt(match[0], 10) : 0;
  }

  function getTimestampFromId(id: string): number {
    // Example: "recipe-1753011024567" → 1753011024567
    const parts = id.split("-");
    const timestamp = parts[parts.length - 1]; // last part after dash
    return Number(timestamp) || 0;
  }


  // filter recipes via horizontal scroll
  let filteredRecipes = [...recipes];

  // 1. Apply search filtering
  if (query.length > 0) {
    const isFavQuery =
      query.startsWith('fav') || query === 'favourite' || query === 'favorite';

    if (isFavQuery) {
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.favourite);
    } else {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        (recipe.title || '').toLowerCase().includes(query) ||
        (recipe.source || '').toLowerCase().includes(query) ||
        (recipe.category || '').toLowerCase().includes(query)
      );
    }
  }
  // 2. Apply category mode
  switch (filters.mode) {
    case 'all':
      filteredRecipes.sort(
        (a, b) => getTimestampFromId(b.id) - getTimestampFromId(a.id)
      );
      break;
    case 'favourites':
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.favourite);
      break;
    case 'quick-meals':
      filteredRecipes = filteredRecipes.filter((recipe) => {
        const totalTime = toMinutes(recipe.prepTime) + toMinutes(recipe.cookTime);
        return totalTime > 0 && totalTime <= 30;
      });
      break;
    case 'newest':
      filteredRecipes.sort(
        (a, b) => getTimestampFromId(b.id) - getTimestampFromId(a.id)
      );
      break;

    case 'oldest':
      filteredRecipes.sort(
        (a, b) => getTimestampFromId(a.id) - getTimestampFromId(b.id)
      );
      break;
    case 'a-z':
      filteredRecipes = [...filteredRecipes].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
      break;
    case 'z-a':
      filteredRecipes = [...filteredRecipes].sort((a, b) =>
        b.title.localeCompare(a.title)
      );
      break;
    case 'all':
    default:
      // no extra filtering
      break;
  }

  const handlePress = (id: string) => {
    router.push(`/recipes/${id}`);
  };


  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={{ flex: 1 }} bg={theme.colors.bg}>
        <HStack px={16} pt={15} pb={6} justifyContent="space-between" alignItems="center">
          <Text fontSize={24} color={theme.colors.text1} style={{ fontFamily: 'Nunito-800' }}>
            Explore Recipes
          </Text>
        </HStack>

        <HStack px={16} pt={1} justifyContent="space-between" alignItems="center">
          <Text fontSize={18} color={theme.colors.text2} style={{ fontFamily: 'Nunito-600' }}>
            <Text>{`${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}`}</Text> 
          </Text>
        </HStack>
        
        <Box mt={15} flex={1}>
          <Input 
            variant="rounded" 
            size="sm" 
            borderWidth={focused ? 2 : 0} // ✅ Add border when focused
            borderColor={focused ? '#999' : "transparent"}
            borderStyle="none"
            borderRadius="$3xl" 
            //backgroundColor='#e3e3e3'
            backgroundColor={theme.colors.bgFocus}
            mx={16}
            
          >
            <InputSlot pl={10}>
              <Ionicons name="search" size={20} color={theme.colors.text2}/>
            </InputSlot>  
            <InputField
              placeholder="Search"
              fontSize={16}
              style={{ fontFamily: 'Nunito-600' }}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
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
            // 3 numColumns={3}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            columnWrapperStyle={{ justifyContent: 'flex-start' }}
            renderItem={({ item, index }) => (
              <Box
                key={item.id}
                style={{
                  width: '48%',
                  marginRight: (index + 1) % 2 === 0 ? 0 : '4%',
                  // 3 width: '31.5%',
                  // 3 marginRight: (index + 1) % 3 === 0 ? 0 : '2.75%',
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
