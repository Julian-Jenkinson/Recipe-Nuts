import { Feather, Ionicons } from '@expo/vector-icons';
import { Box, HStack, Input, InputField, InputSlot, Pressable, Text, View } from '@gluestack-ui/themed';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StatusBar, TouchableWithoutFeedback } from 'react-native';
import Constants from 'expo-constants';
import FilterDrawer from './FilterDrawer';
import RecipeCard from './RecipeCard';
import { useRecipeStore } from '../stores/useRecipeStore';
import theme from '../theme';

export default function RecipeListScreen() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);
  const [selectedFilter, setSelectedFilter] = useState('newest');
  const [localRecipes, setLocalRecipes] = useState(recipes);
  const [searchQuery, setSearchQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const applySorting = (recipesToSort: any[], filterKey: string) => {
    const sorted = [...recipesToSort];

    switch (filterKey) {
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

  useEffect(() => {
    const sortedRecipes = applySorting(recipes, selectedFilter);
    setLocalRecipes(sortedRecipes);
  }, [recipes, selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setTranslucent(true);
        StatusBar.setBarStyle('light-content');
      }
    }, [])
  );

  const applyRecipeStatusBar = useCallback(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setTranslucent(true);
      StatusBar.setBarStyle('light-content');
    }
  }, []);

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
    setSelectedFilter(filterKey);
    const sorted = applySorting(localRecipes, filterKey);
    setLocalRecipes(sorted);
  };

  return (
    <>
      {Platform.OS === 'android' && (
        <View
          style={{
            height: Constants.statusBarHeight,
            backgroundColor: theme.colors.cta,
          }}
        />
      )}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

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
            <View
              bg={theme.colors.cta}
              borderBottomLeftRadius={20}
              borderBottomRightRadius={20}
              mb={15}
            >
              <HStack px={22} pt={10} pb={0} justifyContent="flex-end" alignItems="center">
                <Box alignSelf="flex-start">
                  <Pressable onPress={() => setIsFilterOpen(true)}>
                    <Box pt={6}>
                      <Ionicons name="funnel-outline" size={26} color={theme.colors.bgFocus} />
                    </Box>
                  </Pressable>
                </Box>
              </HStack>

              <HStack mt={10} mb={16} mx={16} alignItems="center" gap={8}>
                <Box flex={1}>
                  <Input
                    variant="rounded"
                    size="lg"
                    borderWidth={focused ? 0 : 0}
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
                      onFocus={() => {
                        setFocused(true);
                        applyRecipeStatusBar();
                      }}
                      onBlur={() => {
                        setFocused(false);
                        applyRecipeStatusBar();
                      }}
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
                  style={{ flex: 1, fontFamily: 'heading-900' }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Recipes
                </Text>
              </HStack>
            )}

            {recipes.length === 0 ? (
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
                  To get started, tap the plus{'\n'}
                  icon to add your first recipe.
                </Text>
              </View>
            ) : filteredRecipes.length === 0 ? (
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
              <FlatList
                data={filteredRecipes}
                numColumns={1}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 20,
                  paddingTop: 10,
                }}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: '#ddd',
                      marginVertical: 25,
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

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedFilter={selectedFilter}
        onSelect={handleFilterSelect}
      />
    </>
  );
}
