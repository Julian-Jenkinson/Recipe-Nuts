import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, Image, Pressable, Text, View } from '@gluestack-ui/themed';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Button, ScrollView, Share, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecipeStore } from '../../stores/useRecipeStore';

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
        <Text >Recipe not found</Text>
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
      message: `Check out this recipe: \n\n${recipe.title}\nBy ${recipe.source}\n\nIngredients: \n\n${ingredients.join('\n')}\n\nInstructions: \n\n ${instructions.join('\n\n') }`,
    });
    } catch (error) {
    if (error instanceof Error) {
      console.error('Error sharing:', error.message);
    } else {
      console.error('Error sharing:', error);
    }
  }
};

  return (
    <SafeAreaView style={{ flex: 1 }}>
      
      {/*Header*/}
      <HStack 
        pl={6} pr={18} py={14} 
        justifyContent="space-between" 
        alignItems="center">
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={30} color="#333" />
        </Pressable>
        <Box flexDirection='row'>
          <Pressable pr={22} onPress={handleShare}>
            <Feather name="share-2" size={20} color="#333" />
          </Pressable>
          <Pressable pr={22}>
            <Feather name="edit-2" size={20} color="#333" />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Feather name="trash-2" size={20} color="#C1121F" />
          </Pressable>
        </Box>
      </HStack>
      
      {/*Image box*/}
      <ScrollView>
        <Box>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" alt='{recipe.title}'/>
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
            <Box
              bg="white"
              p={4}                     
              borderRadius={6}       
              alignItems="center"
              justifyContent="center"
            >
              <FontAwesome
                name={recipe.favourite ? 'star' : 'star-o'}
                size={24}
                color={recipe.favourite ? '#FFC107' : '#999'}
              />
            </Box>
          </Pressable>
        </Box>

        {/*Title display*/}
        <View style={styles.container}>
          <Text fontFamily='Nunito-700' size={'3xl'}>{recipe.title}</Text>
          <Text fontFamily='Nunito-500' size={'md'} color='#888'>By {recipe.source}</Text>
          
          {/*recipe stats*/}
          <HStack 
            pl={6} pr={10} pt={20} 
            justifyContent="space-between" 
            alignItems="flex-start"
            flexWrap="wrap" 
          >
            <Box alignItems="center" flexShrink={1}>
              <Feather name="clock" size={20} color="#333" />
              <Text pt={3} color='#777' fontFamily='Nunito-600' size={'sm'}>
                {+recipe.prepTime + +recipe.cookTime || '-'} mins
              </Text>
            </Box>
            <Box alignItems="center" flexShrink={1}>
              <MaterialCommunityIcons name="bowl-mix-outline" size={20} color="#333" />
              <Text pt={3} color='#777' fontFamily='Nunito-600' size={'sm'}>
                {recipe.category || 'Other'}
              </Text>
            </Box>
            <Box alignItems="center" flexShrink={1}>
              <Feather name="bar-chart" size={20} color="#333" />
              <Text pt={3} color='#777' fontFamily='Nunito-600' size={'sm'}>
                {+recipe.difficulty || 'Medium'}
              </Text>
            </Box>
            <Box alignItems="center" flexShrink={1} maxWidth="25%">
              <Feather name="user" size={20} color="#333" />
              <Text pt={3} color='#777' fontFamily='Nunito-600' size={'sm'}>
                Serves {+recipe.servingSize || '-'}
              </Text>
            </Box>  
          </HStack>
        
        
          {/* Ingredients Section */} 
          <Text fontFamily='Nunito-700' size={'2xl'} my={20}>Ingredients:</Text>
          
          {ingredients.length > 0 ? (
            ingredients.map((item, index) => (
              <Text key={`ing-${index}`} style={styles.itemText}>
                {item}
              </Text>
            ))
          ) : (
            <Text style={styles.itemText}>No ingredients available.</Text>
          )}
          
          {/* Instructions Section */}
          <Text fontFamily='Nunito-700' size={'2xl'} my={20}>Instructions:</Text>
          {instructions.length > 0 ? (
            instructions.map((step, index) => (
              <Text key={`step-${index}`} style={styles.instructionParagraph}>
                {step}
              </Text>
            ))
          ) : (
            <Text style={styles.itemText}>No instructions available.</Text>
          )}

          {notes.length > 0 && (
            <>
              <Text fontFamily='Nunito-700' size={'2xl'}>Notes:</Text>
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
    padding: 16,
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
  metaText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});
