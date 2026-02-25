import { Feather, Ionicons } from '@expo/vector-icons';
import { Box, HStack, Input, InputField, InputSlot, Pressable, Text, View } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StatusBar, TouchableWithoutFeedback } from 'react-native';
import AddRecipeButton from '../../components/AddRecipeButton';
import AddRecipeDrawer from '../../components/AddRecipeDrawer';
import FilterDrawer from '../../components/FilterDrawer';
import RecipeCard from '../../components/RecipeCard';
import { useRecipeStore } from '../../stores/useRecipeStore';
import theme from '../../theme';

import Constants from "expo-constants";

export default function RecipeListScreen() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);
  const [selectedFilter, setSelectedFilter] = useState('newest');

  const [localRecipes, setLocalRecipes] = useState(recipes); // Local filtered/sorted recipes
  const [searchQuery, setSearchQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Function to apply sorting based on filter
  const applySorting = (recipesToSort: any[], filterKey: string) => {
    let sorted = [...recipesToSort];

    switch(filterKey) {
      case 'newest':
        sorted.sort((a, b) => getTimestampFromId(b.id) - getTimestampFromId(a.id));
        break;
      case 'oldest':
        sorted.sort((a, b) => getTimestampFromId(a.id) - getTimestampFromId(b.id));
        break;
      case 'aToZ':
        sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'zToA':
        sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
    }

    return sorted;
  };

  


  // Sync localRecipes if store updates and apply current filter
  useEffect(() => {
    const sortedRecipes = applySorting(recipes, selectedFilter);
    setLocalRecipes(sortedRecipes);
  }, [recipes, selectedFilter]);

  const query = searchQuery.trim().toLowerCase();
  const filteredRecipes = query.length > 0
    ? localRecipes.filter((recipe) =>
        (recipe.title || '').toLowerCase().includes(query) ||
        (recipe.source || '').toLowerCase().includes(query)
      )
    : localRecipes;

  const handlePress = (id: string) => {
    router.push(`/recipes/${id}`);
  };

  const getTimestampFromId = (id: string) => {
    const parts = id.split('-');
    const timestamp = parts[parts.length - 1];
    return Number(timestamp) || 0;
  };

  const handleFilterSelect = (filterKey: string) => {
    setSelectedFilter(filterKey); // Update selected filter state
    const sorted = applySorting(localRecipes, filterKey);
    setLocalRecipes(sorted);
  };

  console.log(recipes)

  return (
    <>
      {/* Fake "status bar background" */}
      {Platform.OS === "android" && (
        <View
          style={{
            height: Constants.statusBarHeight,
            backgroundColor: theme.colors.cta,
          }}
        />
      )}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />


        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
              setFocused(false);
            }}
            accessible={false}
          >
            <View style={{ flex: 1 }} bg={theme.colors.bg}>
              {/* Header */}
              <View 
                bg={theme.colors.cta}
                borderBottomLeftRadius={20}
                borderBottomRightRadius={20}
                mb={15}
              >
                <HStack px={22} pt={10} pb={0} justifyContent="space-between" alignItems="center">
                  <Box p={0}>
                    <Pressable onPress={() => router.push('/menu')} hitSlop={10}>
                      <Ionicons name="menu" size={38} color={theme.colors.bgFocus} />
                    </Pressable>
                  </Box>
            
                  <Box alignSelf="flex-start">
                    <Pressable onPress={() => setIsFilterOpen(true)}>
                      <Box pt={6}>
                        <Ionicons name="funnel-outline" size={26} color={theme.colors.bgFocus} />
                      </Box>
                    </Pressable>
                  </Box>
                </HStack>

                {/* Search Input */}
                <HStack mt={10} mb={16} mx={16} alignItems="center" gap={8}>
                  <Box flex={1}>
                    <Input
                      variant="rounded"
                      size="lg"
                      //borderWidth={focused ? 2 : 1.5}
                      borderWidth={focused ? 0 : 0}
                      //borderColor={focused ? '#666' : '#bbb'}
                      borderStyle="none"
                      borderRadius={16}
                      bg={theme.colors.bgFocus}
                    >
                      <InputField
                        placeholder="Search recipes"
                        selectionColor={theme.colors.cta}
                        fontSize={19}
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
                      <InputSlot pr={10}>
                        <Ionicons name="search" size={20} color="#888" />
                      </InputSlot>
                    </Input>
                  </Box>
                </HStack>
              </View>

              {filteredRecipes.length > 0 && (
                <HStack pl={16} pb={12} pt={4}>
                  <Text 
                      fontSize={26} 
                      color={theme.colors.text1} 
                      style={{ flex:1, fontFamily: 'heading-900'}}
                      numberOfLines={1}
                      ellipsizeMode="tail" //stops cutoff text sometimes
                    >
                      Recipes
                    </Text>
                </HStack>
              )}

              {/* Empty States & List */}
              {recipes.length === 0 ? (
                // 🍽️ Empty state: NO RECIPES AT ALL
                <View flex={1} alignItems="center" justifyContent="center" px={30} pb={90}>
                  <Ionicons name="restaurant-outline" size={72} color={theme.colors.cta} />
                  <Text
                    lineHeight={30}
                    fontSize={20}
                    color={theme.colors.text2}
                    textAlign="center"
                    mt={16}
                    style={{ fontFamily: 'body-500' }}
                  >
                    To get started, tap the plus{"\n"}
                    icon to add your first recipe.
                  </Text>
                </View>
              ) : filteredRecipes.length === 0 ? (
                // Empty state: SEARCH RETURNED NOTHING
                <View flex={1} alignItems="center" justifyContent="center" px={30} pb={90}>
                  <Ionicons name="search-outline" size={72} color={theme.colors.text2} />
                  <Text
                    lineHeight={30}
                    fontSize={20}
                    color={theme.colors.text2}
                    textAlign="center"
                    mt={20}
                    mb={150}
                    style={{ fontFamily: 'body-600' }}
                  >
                    No recipes match your search.
                  </Text>
                </View>
              ) : (
                // Show Recipe List
                <FlatList
                  data={filteredRecipes}
                  numColumns={1}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 20,
                    paddingTop: 10
                  }}
                  ItemSeparatorComponent={() => (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: '#ddd',
                        marginVertical: 25
                      }}
                    />
                  )}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <RecipeCard
                      {...item}
                      onPress={() => handlePress(item.id)}
                      onToggleFavourite={() =>
                        useRecipeStore.getState().toggleFavourite(item.id)
                      }
                    />
                  )}
                />
              )}

              {/* Add Button */}
              <Box position='absolute' bottom={65} right={30}>
                <AddRecipeButton onPress={() => setIsAddOpen(true)} />
              </Box>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      

      {/* Drawers */}
      <AddRecipeDrawer isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <FilterDrawer 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        onFilterSelect={handleFilterSelect}
        selectedFilter={selectedFilter}
      />
    </>
  );
}