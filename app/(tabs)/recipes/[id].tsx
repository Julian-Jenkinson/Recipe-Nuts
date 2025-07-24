import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, Image, Pressable, Text, View } from '@gluestack-ui/themed';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View as RNView,
  ScrollView,
  Share,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecipeStore } from '../../../stores/useRecipeStore';
import theme from '../../../theme';

import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');
const BUTTON_WIDTH = screenWidth / 2 - 40; // half width minus padding

export default function RecipeDetailsScreen() {
  // Move ALL hooks to the top of the component
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const toggleFavourite = useRecipeStore((state) => state.toggleFavourite);
  const recipe = useRecipeStore((state) => (id ? state.getRecipeById(id) : undefined));

  const scrollViewRef = useRef<ScrollView>(null);
  const [ingredientsY, setIngredientsY] = useState(0);
  const [instructionsY, setInstructionsY] = useState(0);
  const [activeSection, setActiveSection] = useState<'ingredients' | 'instructions'>('ingredients');
  const isScrollingProgrammatically = useRef(false);
  const highlightX = useSharedValue(0);

  // Animated highlight style
  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: highlightX.value }],
  }));

  const animateHighlight = (section: 'ingredients' | 'instructions') => {
    const targetX = section === 'ingredients' ? 0 : BUTTON_WIDTH;
    highlightX.value = withSpring(targetX, {
      stiffness: 175,
      damping: 22,
      mass: 1,
    });
  };

  useEffect(() => {
    // initial highlight position
    animateHighlight(activeSection);
  }, []);

  // NOW do your conditional logic and early returns AFTER all hooks
  if (!id) {
    return (
      <View style={styles.centered}>
        <Text>Invalid Recipe ID</Text>
        <Pressable onPress={() => router.replace('/recipes/')}>
          <Text style={{ color: 'blue', marginTop: 10 }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text>Recipe not found</Text>
        <Pressable onPress={() => router.replace('/recipes/')}>
          <Text style={{ color: 'blue', marginTop: 10 }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.map(String) : [];
  const notes = Array.isArray(recipe.notes) ? recipe.notes.map(String) : [];

  const imageUri = recipe.imageUrl?.length ? recipe.imageUrl : 'https://via.placeholder.com/400';

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
            if (recipe.imageUrl && recipe.imageUrl.startsWith(FileSystem.documentDirectory!)) {
              try {
                await FileSystem.deleteAsync(recipe.imageUrl, { idempotent: true });
              } catch (err) {
                console.warn('Failed to delete image:', err);
              }
            }
            deleteRecipe(recipe.id);
            router.replace('/recipes/');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: \n\n${recipe.title}\nBy ${recipe.source}\n\nIngredients:\n${ingredients.join(
          '\n'
        )}\n\nInstructions:\n${instructions.join('\n\n')}`,
      });
    } catch (error) {
      console.error('Error sharing:', error instanceof Error ? error.message : error);
    }
  };

  const scrollToSection = (section: 'ingredients' | 'instructions') => {
    const scrollView = scrollViewRef.current;
    if (!scrollView) return;

    isScrollingProgrammatically.current = true;
    setActiveSection(section);
    animateHighlight(section);

    const OFFSET = -260;
    let y = section === 'ingredients' ? ingredientsY : instructionsY;
    y = y - OFFSET;
    if (y < 0) y = 0;

    scrollView.scrollTo({ y, animated: true });

    // Allow a delay before re-enabling onScroll handler
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 400); // adjust duration to match scroll animation timing
  };

  // Handle swipe gesture
  const onGestureEvent = (event: any) => {
    const { translationX } = event.nativeEvent;

    if (translationX > 50 && activeSection !== 'instructions') {
      // swipe right → Instructions
      scrollToSection('instructions');
    }

    if (translationX < -50 && activeSection !== 'ingredients') {
      // swipe left → Ingredients
      scrollToSection('ingredients');
    }
  };

  // Scroll handler to update toggle on manual scroll
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingProgrammatically.current) {
      // Ignore scroll events triggered by programmatic scroll
      return;
    }

    const yOffset = event.nativeEvent.contentOffset.y;
    const OFFSET = -180; // tweak this to fit your layout/behavior

    if (yOffset + OFFSET >= instructionsY) {
      if (activeSection !== 'instructions') {
        setActiveSection('instructions');
        animateHighlight('instructions');
      }
    } else {
      if (activeSection !== 'ingredients') {
        setActiveSection('ingredients');
        animateHighlight('ingredients');
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <HStack pl={6} pr={18} py={14} justifyContent="space-between" alignItems="center">
          <Pressable onPress={() => router.replace('/recipes/')}>
            <Feather name="chevron-left" size={32} color="#333" />
          </Pressable>
          <Box flexDirection="row">
            <Pressable pr={22} onPress={handleShare}>
              <Feather name="share-2" size={22} color="#333" />
            </Pressable>
            <Pressable pr={22} onPress={() => router.push(`/recipes/EditRecipe?id=${recipe.id}`)}>
              <Feather name="edit-2" size={22} color="#333" />
            </Pressable>
            <Pressable onPress={handleDelete}>
              <Feather name="trash-2" size={22} color="#C1121F" />
            </Pressable>
          </Box>
        </HStack>

        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <Box>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
              accessibilityLabel={`Image of ${recipe.title}`}
              alt={`Image of ${recipe.title}`}
            />
            <Pressable
              onPress={() => toggleFavourite(recipe.id)}
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
            >
              <Box bg="white" p={4} borderRadius={6} alignItems="center" justifyContent="center">
                <FontAwesome
                  name={recipe.favourite ? 'star' : 'star-o'}
                  size={22}
                  color={recipe.favourite ? '#FFC107' : '#999'}
                />
              </Box>
            </Pressable>
          </Box>

          <View style={styles.container}>
            <Text fontFamily="Nunito-700" size="3xl" pt={8} color={theme.colors.text1}>
              {recipe.title}
            </Text>
            <Text fontFamily="Nunito-500" size="md" color={theme.colors.text2}>
              By {recipe.source}
            </Text>

            <HStack
              pl={4}
              pr={10}
              pt={20}
              pb={14}
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap="wrap"
            >
              <Box alignItems="center" flexShrink={1}>
                <Feather name="clock" size={20} color="#777" />
                <Text pt={3} color="#777" fontFamily="Nunito-600" size="sm">
                  {+recipe.prepTime + +recipe.cookTime || '-'} mins
                </Text>
              </Box>
              <Box alignItems="center" flexShrink={1}>
                <MaterialCommunityIcons name="bowl-mix-outline" size={20} color="#777" />
                <Text pt={3} color="#777" fontFamily="Nunito-600" size="sm">
                  {recipe.category || 'Other'}
                </Text>
              </Box>
              <Box alignItems="center" flexShrink={1}>
                <Feather name="bar-chart" size={20} color="#777" />
                <Text pt={3} color="#777" fontFamily="Nunito-600" size="sm">
                  {+recipe.difficulty || 'Medium'}
                </Text>
              </Box>
              <Box alignItems="center" flexShrink={1} maxWidth="25%">
                <Feather name="user" size={20} color="#777" />
                <Text pt={3} color="#777" fontFamily="Nunito-600" size="sm">
                  Serves {+recipe.servingSize || '-'}
                </Text>
              </Box>
            </HStack>

            {/* Ingredients heading */}
            <Text
              fontFamily="Nunito-700"
              size="2xl"
              style={{ marginBottom: 10 }}
              onLayout={(e) => setIngredientsY(e.nativeEvent.layout.y)}
            >
              Ingredients
            </Text>

            {/* Ingredients section */}
            {ingredients.length > 0 ? (
              ingredients.map((item, index) => (
                <Text key={`ing-${index}`} style={styles.itemText}>
                  • {item}
                </Text>
              ))
            ) : (
              <Text style={styles.itemText}>No ingredients available.</Text>
            )}

            {/* Instructions heading */}
            <Text
              fontFamily="Nunito-700"
              size="2xl"
              style={{ marginTop: 30, marginBottom: 10 }}
              onLayout={(e) => setInstructionsY(e.nativeEvent.layout.y)}
            >
              Instructions
            </Text>

            {/* Instructions section */}
            <RNView>
              {instructions.length > 0 ? (
                instructions.map((step, index) => (
                  <Text key={`step-${index}`} style={styles.instructionParagraph}>
                    {index + 1}. {step}
                  </Text>
                ))
              ) : (
                <Text style={styles.itemText}>No instructions available.</Text>
              )}
            </RNView>

            {/* Notes */}
            {notes.length > 0 && (
              <>
                <Text fontFamily="Nunito-700" size="2xl" style={{ marginTop: 20 }}>
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

        {/* Floating buttons fixed near bottom with swipe + animation */}
        <View style={styles.floatingButtonsWrapper}>
          <Box style={styles.outerBox}>
            <PanGestureHandler onGestureEvent={onGestureEvent}>
              <Animated.View style={{ flexDirection: 'row', position: 'relative' }}>
                {/* Sliding Highlight */}
                <Animated.View
                  style={[
                    {
                      position: 'absolute',
                      height: '100%',
                      width: BUTTON_WIDTH,
                      backgroundColor: theme.colors.cta,
                      borderRadius: 14,
                    },
                    highlightStyle,
                  ]}
                />
                {/* Buttons */}
                <Pressable style={styles.toggleButton} onPress={() => scrollToSection('ingredients')}>
                  <Text
                    style={[
                      styles.toggleText,
                      activeSection === 'ingredients' && styles.toggleTextActive,
                    ]}
                  >
                    INGREDIENTS
                  </Text>
                </Pressable>
                <Pressable style={styles.toggleButton} onPress={() => scrollToSection('instructions')}>
                  <Text
                    style={[
                      styles.toggleText,
                      activeSection === 'instructions' && styles.toggleTextActive,
                    ]}
                  >
                    INSTRUCTIONS
                  </Text>
                </Pressable>
              </Animated.View>
            </PanGestureHandler>
          </Box>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    // width: BUTTON_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    color: theme.colors.text1,
    fontWeight: '600',
    fontSize: 16,
  },
  toggleTextActive: {
    color: theme.colors.ctaText,
  },
  floatingButtonsWrapper: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 100,
    alignItems: 'center',
  },
  outerBox: {
    //backgroundColor: '#ddd',
    backgroundColor: theme.colors.bg,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});