import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Button, ScrollView, Text } from 'react-native';
import { useRecipeStore } from '../stores/useRecipeStore';
import { downloadAndStoreImage } from '../utils/downloadAndStoreImage'; // adjust path as needed

export default function AddRecipeForm() {
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const router = useRouter();

  const testRecipe = {
    id: 'test-001',
    title: 'Simple Pancakes',
    ingredients: ['Flour', 'Eggs', 'Milk'],
    instructions: ['Mix ingredients', 'Pour on pan', 'Cook until golden'],
    imageUrl: encodeURI('https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-202451_12-50a0c95.jpg?resize=440,400'), // guaranteed to work
  };

  const isValidImageUrl = (url: string) => {
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
};


  const handleAddTestRecipe = async () => {
  console.log("Add Recipe button clicked");
  if (!isValidImageUrl(testRecipe.imageUrl)) {
    Alert.alert('Invalid Image URL', 'Please use a direct image link ending in .jpg, .png, etc.');
    return;
  }

  try {
    const localImageUri = await downloadAndStoreImage(testRecipe.imageUrl);
    console.log("downloadAndStoreImage returned:", localImageUri);

    if (!localImageUri) {
      Alert.alert('Image Download Failed', 'Could not download the image locally.');
      return;
    }

    const recipeWithLocalImage = {
      ...testRecipe,
      imageUrl: localImageUri,
    };

    console.log('Saving test recipe with local image:', recipeWithLocalImage);
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
