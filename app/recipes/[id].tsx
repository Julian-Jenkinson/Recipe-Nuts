import { Feather, FontAwesome, Octicons } from '@expo/vector-icons';
import { Box, HStack, Image, Pressable, StatusBar, Text, View } from '@gluestack-ui/themed';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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
  const recipe = useRecipeStore((state) => state.getRecipeById(id || ''));

  const scrollViewRef = useRef<ScrollView>(null);

  const [tickedIngredients, setTickedIngredients] = useState<boolean[]>([]);
  const [tickedInstructions, setTickedInstructions] = useState<boolean[]>([]);

  const ingredients = recipe ? (Array.isArray(recipe.ingredients) ? recipe.ingredients.map(String) : []) : [];
  const instructions = recipe ? (Array.isArray(recipe.instructions) ? recipe.instructions : []) : [];
  
  const notes = recipe && Array.isArray(recipe.notes) ? recipe.notes.map(String) : [];
  const imageUri = recipe?.imageUrl?.length ? recipe.imageUrl : 'https://via.placeholder.com/400';


  React.useEffect(() => {
    if (!recipe) return;
    setTickedIngredients(ingredients.map(() => false));
    setTickedInstructions(instructions.map(() => false));
  }, [recipe?.id]);



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

  const toggleIngredient = (index: number) => {
    setTickedIngredients(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const toggleInstruction = (index: number) => {
    setTickedInstructions(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };


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
        )}\n\nInstructions:\n${instructions.join('\n\n')}\n\nRecipe shared by Recipe Nuts\n\nAvailable on the Play Store`,
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
          <Text style={styles.headingMd}>{recipe.source}</Text>

          {/* Recipe Image & Favorite */}
        <Box>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" borderRadius={12}/>
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

          {/* Ingredients */}
          <Text style={styles.heading2xl}>Ingredients</Text>
          <Box style={styles.ingredientBox}>
            {ingredients.length > 0 ? (
              ingredients.map((item, index) => (
                
                <View key={`ing-${index}`}>
                  <Pressable onPress={() => toggleIngredient(index)}>                  
                    <HStack style={styles.ingredientHStack}>
                      <Box style={tickedIngredients[index]
                        ? styles.ingredientTicked
                        : styles.ingredientNotTicked
                        
                      }>
                        {tickedIngredients[index] && (
                          <Octicons name="check" size={20} color={theme.colors.ctaText} />
                        )}
                      </Box>
                      <Text style={[
                        styles.ingredientText, 
                        tickedIngredients[index] && { opacity: 0.3 }]}
                      >
                        {item}
                      </Text>
                    </HStack>
                  </Pressable> 
                </View>
              ))
            ) : (
              <Text style={styles.itemText}>No ingredients available</Text>
            )}
          </Box>

          {/* Instructions */}
          <Text style={styles.heading2xl}>Instructions</Text>
          <RNView>
            {instructions.length > 0 ? (
              instructions.map((step, index) => (
                <Pressable key={`step-${index}`} onPress={() => toggleInstruction(index)}>
                  <View style={{ marginBottom: index === instructions.length - 1 ? 0 : 25 }}>
                    <HStack style={styles.instructionHStack}>
                      <View
                        style={[
                          styles.stepHeading,
                          tickedInstructions[index] && { backgroundColor: theme.colors.cta, borderWidth:0, opacity: tickedInstructions[index] ? 0.75 : 1 }, // optional
                        ]}
                      >
                        {tickedInstructions[index] ? (
                          <Octicons name="check" size={20} color={theme.colors.ctaText} />
                        ) : (
                          <Text style={{ color: 'white', fontFamily: 'body-700' }}>{index + 1}</Text>
                        )}
                      </View>
                      <Text 
                        style={[
                          styles.instructionParagraph,
                          {opacity: tickedInstructions[index] ? 0.3 : 1}]}
                      >
                        {step}
                      </Text>
                    </HStack>
                  </View>
                </Pressable>
              ))
            ) : (
              <Box style={styles.ingredientBox}>
                <Text style={styles.itemText}>No instructions available</Text>
              </Box>
            )}
          </RNView>

          {/* Notes */}
          {notes.length > 0 && (
            <>
              <Text style={styles.heading2xl}>Notes</Text>
              <Box style={styles.note}>
                {notes.map((note, index) => (
                  <Text key={`note-${index}`} style={styles.noteText}>
                  {note}
                  </Text>
                ))}
              </Box>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 16 }
    ,
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  image: { 
    width: '100%', 
    height: 300 
  },
  ingredientBox: {
    backgroundColor: theme.colors.paper, 
    paddingHorizontal:16, 
    paddingVertical:24, 
    borderRadius:12, 
    gap: 20
  },
  ingredientHStack: {
    //alignItems:'flex-start',
    alignItems:'center',
    borderRadius: 12,
    gap: 10,
  },
  ingredientNotTicked: {
    lineHeight:28,
    width:30,
    height:30,
    borderRadius:15,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#888',
    borderStyle:'dashed',
    borderWidth:1,
    //backgroundColor: theme.colors.cta,
    //borderWidth:0,
  },
  ingredientTicked: {
    lineHeight:28,
    width:30,
    height:30,
    borderRadius:15,
    justifyContent: 'center',
    alignItems: 'center',
    //borderColor: '#888',
    //borderStyle:'dashed',
    //borderWidth:1,
    backgroundColor: theme.colors.cta,
    borderWidth:0,
    opacity:0.75,
  },
  ingredientText: { 
    paddingLeft: 16,
    paddingRight: 42,
    fontSize: 16, 
    lineHeight: 28, 
    fontFamily: 'body-500', 
    color: theme.colors.text1 
  },
  instructionHStack: {
    alignItems:'center',
    paddingHorizontal:16, 
    paddingVertical:24, 
    borderRadius: 12,
    gap: 10,
    backgroundColor: theme.colors.paper, 
  },
  stepHeading: { 
    fontFamily: 'body-700', 
    fontSize: 16, 
    lineHeight:28,
    width:30,
    height:30,
    borderRadius:15,
    backgroundColor: theme.colors.cta,
    justifyContent:'center',
    alignItems: 'center',
    //borderColor: '#888',
    //borderStyle:'dashed',
    //borderWidth:1,
  },
  instructionParagraph: {
    paddingLeft:16,
    paddingRight: 42,
    fontSize: 16,
    lineHeight: 28, 
    fontFamily: 'body-500', 
    color: theme.colors.text1 
  },
  note: {
    alignItems:'flex-start',
    paddingHorizontal:16, 
    paddingVertical:16, 
    borderRadius: 12,
    backgroundColor: theme.colors.paper, 
  },
  noteText: {
    paddingVertical:6,
    fontSize: 16,
    lineHeight: 28, 
    fontFamily: 'body-500', 
    color: theme.colors.text1 
  },
  itemText: {
    paddingHorizontal:16,
    paddingVertical:16,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 28, 
    fontFamily: 'body-600', 
    color: theme.colors.text1 
  },
  heading2xl: { 
    fontSize: 24, 
    fontFamily: 'heading-900', 
    marginBottom: 20, 
    marginTop: 30, 
    color: theme.colors.text1 
  },
  heading3xl: { 
    fontSize: 30, 
    fontFamily: 'heading-900', 
    paddingTop: 14, 
    color: theme.colors.text1 
  },
  headingMd: { 
    fontSize: 18, 
    fontFamily: 'body-600', 
    marginTop: 5, 
    marginBottom: 15, 
    color: theme.colors.text2 
  },
  metaText: { 
    fontSize: 16, 
    fontFamily: 'body-600', 
    color: theme.colors.text1, 
    textAlign: 'center', 
    paddingLeft: 6,
    paddingRight: 22 
  },
  body400: { 
    fontFamily: 'body-400' 
  },
});
