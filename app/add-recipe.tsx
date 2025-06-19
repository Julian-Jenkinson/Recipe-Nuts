import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Button, Image, ScrollView, Text } from 'react-native';
//import { v4 as uuidv4 } from 'uuid';
import { useRecipeStore } from '../stores/useRecipeStore';
import { downloadAndStoreImage } from '../utils/downloadAndStoreImage'; // adjust path as needed


const defaultImage = require('../assets/images/error.png'); // adjust path if needed


export default function AddRecipeForm() {
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const router = useRouter();

  const testRecipe = {
    id: `recipe-${Date.now()}`,
    title: 'Simple Pancakes',
    ingredients: ['Flour', 'Eggs', 'Milk'],
    instructions: ['Mix ingredients', 'Pour on pan', 'Cook until golden'],
    imageUrl: encodeURI('not url'), // guaranteed to work
  };

  const isValidImageUrl = (url: string) => {
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
};


const handleAddTestRecipe = async () => {
  console.log("Add Recipe button clicked");

  let localImageUri: string;

  try {
    if (isValidImageUrl(testRecipe.imageUrl)) {
      const downloaded = await downloadAndStoreImage(testRecipe.imageUrl);
      console.log("downloadAndStoreImage returned:", downloaded);
      localImageUri = downloaded ?? Image.resolveAssetSource(defaultImage).uri;
    } else {
      console.warn("Invalid image URL — using fallback image.");
      localImageUri = Image.resolveAssetSource(defaultImage).uri;
    }

    const recipeWithLocalImage = {
      ...testRecipe,
      imageUrl: localImageUri,
    };

    console.log('Saving test recipe with image:', recipeWithLocalImage);
    addRecipe(recipeWithLocalImage);
    console.log('Test recipe saved!');
    router.back();

  } catch (error) {
    console.error("Error in handleAddTestRecipe:", error);
    Alert.alert('Error', 'Something went wrong while downloading the image.');
  }
};


return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ marginBottom: 12 }}>
        Press the button to add a test recipe with a downloaded local image.
      </Text>
      <Button title="Add Test Recipe" onPress={handleAddTestRecipe} />
    </ScrollView>
  );
}
