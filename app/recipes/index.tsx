import { Feather, Ionicons } from '@expo/vector-icons';
import { Box, HStack, Input, InputField, InputSlot, Pressable, Text, View } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddRecipeButton from '../../components/AddRecipeButton';
import AddRecipeDrawer from '../../components/AddRecipeDrawer';
// import HorizontalScroll, { FiltersType } from '../../components/HorizontalScroll';  // Commented out
import FilterDrawer from '../../components/FilterDrawer';
import RecipeCard from '../../components/RecipeCard';
import { useRecipeStore } from '../../stores/useRecipeStore';
import theme from '../../theme';

export default function RecipeListScreen() {

  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);


  const recipes = useRecipeStore((state) => state.recipes);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);

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
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
              setFocused(false);
            }}
            accessible={false}
          >
            <View style={{ flex: 1 }} bg={theme.colors.bg}>
              {/* ✅ Header */}
              <HStack px={16} pt={20} pb={6} justifyContent="space-between" alignItems="center">
                
                <Box pr={10}>
                  <Pressable onPress={() => router.push('/menu')} hitSlop={10}>
                    <Ionicons name="menu-sharp" size={32} color={theme.colors.text1} />
                  </Pressable>
                </Box>

                <Text 
                  fontSize={24} 
                  color={theme.colors.text1} 
                  style={{ flex:1, fontFamily: 'heading-800'}}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Recipe Nuts
                </Text>
              </HStack>

              {/* ✅ Search Input */}
              <HStack my={15} mx={16} alignItems="center" gap={8}>
                <Box flex={1}>
                  <Input
                    variant="rounded"
                    size="lg"
                    borderWidth={focused ? 2 : 1.5}
                    borderColor={focused ? '#000' : '#000'}
                    borderStyle="none"
                    borderRadius={8}
                  >
                    <InputSlot pl={8}>
                      <Ionicons name="search" size={22} color={theme.colors.text1} />
                    </InputSlot>
                    <InputField
                      placeholder="Search recipes"
                      selectionColor={theme.colors.cta}
                      fontSize={18}
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
                
                <Box alignSelf="flex-start">
                  <Pressable onPress={() => setIsFilterOpen(true)}>
                    <Box 
                      p={6} 
                      alignItems="center" 
                      justifyContent="center"
                    >
                      <Ionicons name="options" size={30} color="#000" />
                    </Box>
                  </Pressable>
                </Box>
              </HStack>

              {/* // HorizontalScroll component commented out */}
              {/* <HorizontalScroll filters={filters} setFilters={setHorizontalFilters} /> */}
              
              <FlatList
                data={filteredRecipes}
                numColumns={1}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop:10 }}
                ItemSeparatorComponent={() => (
                  <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 20 }} />
                )}
                keyboardShouldPersistTaps="handled" // ✅ Taps on list also close keyboard
                renderItem={({ item }) => (
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
              />

              <Box position='absolute' bottom={25} right={30}>
                <AddRecipeButton onPress={() => {
                  console.log("Add recipe button pressed");
                  setIsAddOpen(true);
                }} />
              </Box>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <AddRecipeDrawer isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  );
}
