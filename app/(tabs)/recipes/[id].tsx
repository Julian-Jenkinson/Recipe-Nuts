import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, Image, Pressable, Text, View } from '@gluestack-ui/themed';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Button, Dimensions, ScrollView, Share, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecipeStore } from '../../../stores/useRecipeStore';

const { width: screenWidth } = Dimensions.get('window');

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return (
      <View style={styles.centered}>
        <Text>Invalid Recipe ID</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const recipe = useRecipeStore((state) => state.getRecipeById(id));
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const toggleFavourite = useRecipeStore((state) => state.toggleFavourite);

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text>Recipe not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.map(String) : [];
  const notes = Array.isArray(recipe.notes) ? recipe.notes.map(String) : [];

  const imageUri = recipe.imageUrl?.length
    ? recipe.imageUrl
    : 'https://via.placeholder.com/400';

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (imageUri.startsWith(FileSystem.documentDirectory!)) {
              try {
                await FileSystem.deleteAsync(imageUri, { idempotent: true });
              } catch (err) {
                console.warn('Failed to delete image:', err);
              }
            }
            deleteRecipe(recipe.id);
            router.back();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: \n\n${recipe.title}\nBy ${recipe.source}\n\nIngredients: \n\n${ingredients.join('\n')}\n\nInstructions: \n\n ${instructions.join('\n\n')}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error sharing:', error.message);
      } else {
        console.error('Error sharing:', error);
      }
    }
  };

  // Scroll and toggle state for ingredients/instructions horizontal paging
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToPage = (index: number) => {
    setActiveIndex(index);
    scrollViewRef.current?.scrollTo({ x: screenWidth * index, animated: true });
  };

  const onScroll = (event: { nativeEvent: { contentOffset: { x: any; }; }; }) => {
    const x = event.nativeEvent.contentOffset.x;
    const page = Math.round(x / screenWidth);
    if (page !== activeIndex) {
      setActiveIndex(page);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      {/* Header */}
      <HStack pl={6} pr={18} py={14} justifyContent="space-between" alignItems="center">
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={32} color="#333" />
        </Pressable>
        <Box flexDirection="row">
          <Pressable pr={22} onPress={handleShare}>
            <Feather name="share-2" size={22} color="#333" />
          </Pressable>
          <Pressable pr={22}>
            <Feather name="edit-2" size={22} color="#333" />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Feather name="trash-2" size={20} color="#C1121F" />
          </Pressable>
        </Box>
      </HStack>

      {/* Image Box */}
      <ScrollView>
        <Box>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" alt={recipe.title} />
          {/* Heart icon overlay */}
          <Pressable
            onPress={() => toggleFavourite(recipe.id)}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 10,
            }}
          >
            <Box bg="white" p={4} borderRadius={6} alignItems="center" justifyContent="center">
              <FontAwesome
                name={recipe.favourite ? 'star' : 'star-o'}
                size={24}
                color={recipe.favourite ? '#FFC107' : '#999'}
              />
            </Box>
          </Pressable>
        </Box>

        {/* Title and stats */}
        <View style={styles.container}>
          <Text fontFamily="Nunito-700" size={'3xl'} pt={8}>
            {recipe.title}
          </Text>
          <Text fontFamily="Nunito-500" size={'md'} color="#888">
            By {recipe.source}
          </Text>

          <HStack
            pl={4}
            pr={10}
            pt={20}
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
          >
            <Box alignItems="center" flexShrink={1}>
              <Feather name="clock" size={20} color="#333" />
              <Text pt={3} color="#777" fontFamily="Nunito-600" size={'sm'}>
                {+recipe.prepTime + +recipe.cookTime || '-'} mins
              </Text>
            </Box>
            <Box alignItems="center" flexShrink={1}>
              <MaterialCommunityIcons name="bowl-mix-outline" size={20} color="#333" />
              <Text pt={3} color="#777" fontFamily="Nunito-600" size={'sm'}>
                {recipe.category || 'Other'}
              </Text>
            </Box>
            <Box alignItems="center" flexShrink={1}>
              <Feather name="bar-chart" size={20} color="#333" />
              <Text pt={3} color="#777" fontFamily="Nunito-600" size={'sm'}>
                {+recipe.difficulty || 'Medium'}
              </Text>
            </Box>
            <Box alignItems="center" flexShrink={1} maxWidth="25%">
              <Feather name="user" size={20} color="#333" />
              <Text pt={3} color="#777" fontFamily="Nunito-600" size={'sm'}>
                Serves {+recipe.servingSize || '-'}
              </Text>
            </Box>
          </HStack>

          {/* Toggle buttons for Ingredients/Instructions */}
          <Box flexDirection="row" justifyContent="center" my={20}>
            <Pressable
              onPress={() => scrollToPage(0)}
              style={[styles.toggleButton, activeIndex === 0 && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, activeIndex === 0 && styles.toggleTextActive]}>Ingredients</Text>
            </Pressable>
            <Pressable
              onPress={() => scrollToPage(1)}
              style={[styles.toggleButton, activeIndex === 1 && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, activeIndex === 1 && styles.toggleTextActive]}>Instructions</Text>
            </Pressable>
          </Box>

          {/* Horizontal scroll for Ingredients and Instructions */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScroll}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            nestedScrollEnabled
          >
            {/* Ingredients page */}
            <View style={[styles.page, { width: screenWidth - 32 }]}>
              {ingredients.length > 0 ? (
                ingredients.map((item, index) => (
                  <Text key={`ing-${index}`} style={styles.itemText}>
                    • {item}
                  </Text>
                ))
              ) : (
                <Text style={styles.itemText}>No ingredients available.</Text>
              )}
            </View>

            {/* Instructions page */}
            <View style={[styles.page, { width: screenWidth - 32 }]}>
              {instructions.length > 0 ? (
                instructions.map((step, index) => (
                  <Text key={`step-${index}`} style={styles.instructionParagraph}>
                    {index + 1}. {step}
                  </Text>
                ))
              ) : (
                <Text style={styles.itemText}>No instructions available.</Text>
              )}
            </View>
          </ScrollView>

          {/* Notes section (unchanged) */}
          {notes.length > 0 && (
            <>
              <Text fontFamily="Nunito-700" size={'2xl'} style={{ marginTop: 20 }}>
                Notes:
              </Text>
              {notes.map((note, idx) => (
                <Text key={`note-${idx}`} style={styles.itemText}>
                  • {note}
                </Text>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  instructionParagraph: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  image: {
    width: '100%',
    height: 270,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 8,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 24,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#000',
  },
  toggleText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  toggleTextActive: {
    color: '#fff',
  },
  page: {
    paddingHorizontal: 30,
    paddingVertical: 8,
  },
});
