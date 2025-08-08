import { Feather, Ionicons } from '@expo/vector-icons';
import {
  Box,
  HStack,
  Input,
  InputField,
  InputSlot,
  Pressable,
  Text,
  View,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddRecipeButton from '../../components/AddRecipeButton';
import AddRecipeDrawer from '../../components/AddRecipeDrawer';
// import HorizontalScroll, { FiltersType } from '../../components/HorizontalScroll';  // Commented out
import RecipeCard from '../../components/RecipeCard';
import { useRecipeStore } from '../../stores/useRecipeStore';
import theme from '../../theme';

export default function RecipeListScreen() {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const recipes = useRecipeStore((state) => state.recipes);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);

  // // ✅ Always initialize filters properly
  // const [filters, setFilters] = React.useState<FiltersType>({ mode: 'all' }); // Commented out

  // // ✅ Always dismiss keyboard before changing filters
  // const setHorizontalFilters = React.useCallback(
  //   (value: React.SetStateAction<FiltersType>) => {
  //     Keyboard.dismiss();
  //     setFilters(value);
  //   },
  //   []
  // );

  const query = searchQuery.trim().toLowerCase();

  function toMinutes(timeString?: string): number {
    if (!timeString) return 0;
    const match = timeString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  function getTimestampFromId(id: string): number {
    const parts = id.split('-');
    const timestamp = parts[parts.length - 1];
    return Number(timestamp) || 0;
  }

  // // ✅ Filtering logic
  // let filteredRecipes = [...recipes];

  // if (query.length > 0) {
  //   const isFavQuery =
  //     query.startsWith('fav') || query === 'favourite' || query === 'favorite';

  //   if (isFavQuery) {
  //     filteredRecipes = filteredRecipes.filter((recipe) => recipe.favourite);
  //   } else {
  //     filteredRecipes = filteredRecipes.filter(
  //       (recipe) =>
  //         (recipe.title || '').toLowerCase().includes(query) ||
  //         (recipe.source || '').toLowerCase().includes(query) ||
  //         (recipe.category || '').toLowerCase().includes(query)
  //     );
  //   }
  // } else {
  //   filteredRecipes = [...recipes]; // show all if no search query
  // }

  // // Apply filters (disabled)
  // switch (filters.mode) {
  //   case 'all':
  //     filteredRecipes.sort((a, b) => getTimestampFromId(b.id) - getTimestampFromId(a.id));
  //     break;
  //   case 'favourites':
  //     filteredRecipes = filteredRecipes.filter((recipe) => recipe.favourite);
  //     break;
  //   case 'quick-meals':
  //     filteredRecipes = filteredRecipes.filter((recipe) => {
  //       const totalTime = toMinutes(recipe.prepTime) + toMinutes(recipe.cookTime);
  //       return totalTime > 0 && totalTime <= 30;
  //     });
  //     break;
  //   case 'newest':
  //     filteredRecipes.sort((a, b) => getTimestampFromId(b.id) - getTimestampFromId(a.id));
  //     break;
  //   case 'oldest':
  //     filteredRecipes.sort((a, b) => getTimestampFromId(a.id) - getTimestampFromId(b.id));
  //     break;
  //   case 'a-z':
  //     filteredRecipes = [...filteredRecipes].sort((a, b) => a.title.localeCompare(b.title));
  //     break;
  //   case 'z-a':
  //     filteredRecipes = [...filteredRecipes].sort((a, b) => b.title.localeCompare(a.title));
  //     break;
  //   default:
  //     break;
  // }

  // For now, filteredRecipes is just recipes filtered by search query or all
  const filteredRecipes = query.length > 0
    ? recipes.filter((recipe) =>
        (recipe.title || '').toLowerCase().includes(query) ||
        (recipe.source || '').toLowerCase().includes(query)
      )
    : recipes;

  const handlePress = (id: string) => {
    router.push(`/recipes/${id}`);
  };

  return (
    <>
      <SafeAreaView edges={['top','bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1 }} bg={theme.colors.bg}>
            {/* ✅ Header */}
            
            <Pressable onPress={() => router.push('/menu')} hitSlop={10}>
              <Box ml={0} mt={8} mb={8}>
                <Feather name="menu" size={28} color="#000" />
              </Box>
            </Pressable>

            <HStack px={16} pt={0} pb={6} justifyContent="space-between" alignItems="center">
              <Text 
                fontSize={24} 
                color={theme.colors.text1} 
                style={{ flex:1, fontFamily: 'heading-800'}}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                All Recipes
              </Text>
            </HStack>

            {/* ✅ Search Input */}
            <Box my={15} mx={16}>
              <Input
                variant="rounded"
                size="sm"
                borderTopWidth={0}
                borderLeftWidth={0}
                borderRightWidth={0}
                borderBottomWidth={focused ? 1.3 : 0}
                borderColor={focused ? '#444' : 'transparent'}
                borderStyle="none"
                borderRadius="0"
                backgroundColor={theme.colors.bgFocus}
              >
                <InputSlot pl={0}>
                  <Ionicons name="search" size={26} color={theme.colors.text1} />
                </InputSlot>
                <InputField
                  placeholder="Search"
                  fontSize={16}
                  style={{ fontFamily: 'body-400' }}
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
            </Box>

            {/* // HorizontalScroll component commented out */}
            {/* <HorizontalScroll filters={filters} setFilters={setHorizontalFilters} /> */}
            
            {/* ✅ Only FlatList wrapped with dismiss touch */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <FlatList
                data={filteredRecipes}
                numColumns={2}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                columnWrapperStyle={{ justifyContent: 'flex-start' }}
                keyboardShouldPersistTaps="handled" // ✅ Taps on list also close keyboard
                renderItem={({ item, index }) => (
                  <Box
                    key={item.id}
                    style={{
                      width: '48%',
                      marginRight: (index + 1) % 2 === 0 ? 0 : '4%',
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
            </TouchableWithoutFeedback>

            <Box position='absolute' bottom={30} right={30} >
              <Pressable 
                onPress={() => {
                  console.log('Opening drawer') // ✅ TEMP LOG
                  setIsAddOpen(true)
                  }
                }
                accessibilityLabel="Add Recipe"
                hitSlop={1}
              >
                <AddRecipeButton onPress={() => {
                  console.log("Add recipe button pressed");
                  setIsAddOpen(true);
                }} />

              </Pressable>
            </Box>
          
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <AddRecipeDrawer isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}
