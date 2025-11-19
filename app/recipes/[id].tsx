import { Feather, FontAwesome } from '@expo/vector-icons';
import { Box, HStack, Image, Pressable, StatusBar, Text, View } from '@gluestack-ui/themed';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  Alert,
  View as RNView,
  ScrollView,
  Share,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecipeStore } from '../../stores/useRecipeStore';
import theme from '../../theme';

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const toggleFavourite = useRecipeStore((state) => state.toggleFavourite);
  const recipe = useRecipeStore((state) => (id ? state.getRecipeById(id) : undefined));

  const scrollViewRef = useRef<ScrollView>(null);

  if (!id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body400}>Invalid Recipe ID</Text>
        <Pressable onPress={() => router.replace('/recipes/')}>
          <Text style={[styles.body400, { color: 'blue', marginTop: 10 }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body400}>Recipe not found</Text>
        <Pressable onPress={() => router.replace('/recipes/')}>
          <Text style={[styles.body400, { color: 'blue', marginTop: 10 }]}>Go Back</Text>
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

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />

      {/* Header */}
      <HStack pl={6} pr={18} py={14} justifyContent="space-between" alignItems="center">
        <Pressable hitSlop={5} onPress={() => router.replace('/recipes/')}>
          <Feather name="chevron-left" size={32} color="#333" />
        </Pressable>
        <Box flexDirection="row">
          <Pressable pr={28} hitSlop={5} onPress={handleShare}>
            <Feather name="share-2" size={23} color="#333" />
          </Pressable>
          <Pressable pr={28} hitSlop={5} onPress={() => router.push(`/recipes/EditRecipe?id=${recipe.id}`)}>
            <Feather name="edit-2" size={23} color="#333" />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={5}>
            <Feather name="trash-2" size={23} color="#C1121F" />
          </Pressable>
        </Box>
      </HStack>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.heading3xl}>{recipe.title}</Text>
          <Text style={styles.headingMd}>By {recipe.source}</Text>

          {/* Recipe Image & Favorite */}
        <Box>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" borderRadius={4}/>
          <Pressable
            onPress={() => toggleFavourite(recipe.id)}
            hitSlop={5}
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
          
          {/* Recipe Stats 2 */}
          <HStack paddingTop={20}>
              <Feather name="clock" size={18} color="#111" />
              <Text style={styles.metaText}>
                {+recipe.prepTime + +recipe.cookTime || '-'} mins
              </Text>

              <Feather name="user" size={18} color="#111" />
              <Text style={styles.metaText}>
                Serves {+recipe.servingSize || '-'}
              </Text>

              <Feather name="bar-chart" size={18} color="#111" />
              <Text style={styles.metaText}>
                {recipe.difficulty || 'Medium'}
              </Text>
          </HStack>

          <View style={styles.pageBreak} />

          {/* Ingredients */}
          <Text style={styles.heading2xl}>Ingredients</Text>
          {ingredients.length > 0
            ? ingredients.map((item, index) => (
                <Text key={`ing-${index}`} style={styles.itemText}>
                  {item}
                </Text>
              ))
            : <Text style={styles.itemText}>No ingredients available.</Text>}

          <View style={styles.pageBreak} />

          {/* Instructions */}
          <Text style={styles.heading2xl}>Instructions</Text>
          <RNView>
            {instructions.length > 0 ? (
              instructions.map((step, index) => (
                <View key={`step-${index}`} style={{ marginBottom: 16 }}>
                  <Text style={styles.stepHeading}>Step {index + 1}</Text>
                  <Text style={styles.instructionParagraph}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.itemText}>No instructions available.</Text>
            )}
          </RNView>

          {/* Notes */}
          {notes.length > 0 && (
            <>
              <View style={styles.pageBreak} />
              <Text style={styles.heading2xl}>Notes:</Text>
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
  container: { paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  image: { width: '100%', height: 300 },
  itemText: { fontSize: 16, marginBottom: 20, lineHeight: 28, fontFamily: 'body-500', color: theme.colors.text1 },
  instructionParagraph: { fontSize: 16, marginBottom: 20, lineHeight: 28, fontFamily: 'body-500', color: theme.colors.text1 },
  stepHeading: { fontFamily: 'body-700', fontSize: 16, marginBottom: 4, color: theme.colors.text1 },
  heading2xl: { fontSize: 20, fontFamily: 'body-700', marginBottom: 15, marginTop: 20, color: theme.colors.text1 },
  heading3xl: { fontSize: 28, fontFamily: 'body-700', paddingTop: 14, color: theme.colors.text1 },
  headingMd: { fontSize: 16, fontFamily: 'body-600', marginTop: 10, marginBottom: 15, color: theme.colors.text1 },
  metaText: { fontSize: 16, fontFamily: 'body-600', color: theme.colors.text1, textAlign: 'center', paddingLeft:6,paddingRight:22 },
  body400: { fontFamily: 'body-400' },
  pageBreak: { height: 1, backgroundColor: '#ddd', marginTop: 20 },
});
