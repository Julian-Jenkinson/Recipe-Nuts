import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, ScrollView, Text, TextInput } from 'react-native';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs
import { Recipe, useRecipeStore } from '../stores/useRecipeStore';
import { downloadAndStoreImage } from '../utils/downloadAndStoreImage'; // adjust path


export default function AddRecipeForm() {
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const router = useRouter();


  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructionsText, setInstructionsText] = useState('');

  const onSubmit = async () => {
  if (!title.trim()) {
    alert('Please enter a title');
    return;
  }

  const localImageUri = await downloadAndStoreImage(imageUrl);

  if (!localImageUri) {
    alert('Failed to download image');
    return;
  }

  const newRecipe: Recipe = {
    id: uuidv4(),
    title,
    imageUrl: localImageUri, // now a local URI
    ingredients: ingredientsText.split('\n').filter(Boolean),
    instructions: instructionsText.split('\n').filter(Boolean),
  };

  addRecipe(newRecipe);

  // Reset form
  setTitle('');
  setImageUrl('');
  setIngredientsText('');
  setInstructionsText('');
  router.back(); // return to list
};

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text>Title:</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Recipe title"
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }}
      />

      <Text>Image URL:</Text>
      <TextInput
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="Image URL"
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }}
      />

      <Text>Ingredients (one per line):</Text>
      <TextInput
        value={ingredientsText}
        onChangeText={setIngredientsText}
        placeholder="Enter ingredients"
        multiline
        numberOfLines={4}
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8, height: 100 }}
      />

      <Text>Instructions (one step per line):</Text>
      <TextInput
        value={instructionsText}
        onChangeText={setInstructionsText}
        placeholder="Enter instructions"
        multiline
        numberOfLines={6}
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8, height: 140 }}
      />

      <Button title="Add Recipe" onPress={onSubmit} />
    </ScrollView>
  );
}
