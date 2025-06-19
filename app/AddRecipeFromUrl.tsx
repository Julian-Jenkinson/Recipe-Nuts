import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput } from 'react-native';
import { useRecipeStore } from '../stores/useRecipeStore';
import { downloadAndStoreImage } from '../utils/downloadAndStoreImage';

export default function AddRecipeFromUrl() {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const router = useRouter();

  const handleAddFromUrl = async () => {
    if (!inputUrl.trim()) {
      Alert.alert('Missing URL', 'Please enter a recipe URL.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://recipe-extractor-api.fly.dev/extract?url=${encodeURIComponent(inputUrl)}`);
      if (!response.ok) throw new Error('Invalid response from API');

      const data = await response.json();

      if (!data.title || !data.ingredients?.length || !data.instructions?.length) {
        throw new Error('Incomplete recipe data');
      }

      // ✅ Download image locally if available
      let localImageUri = '';
      if (data.image) {
        localImageUri = await downloadAndStoreImage(data.image) || '';
      }

      const newRecipe = {
        id: `recipe-${Date.now()}`,
        title: data.title,
        ingredients: data.ingredients,
        instructions: data.instructions,
        imageUrl: localImageUri || '', // fallback blank if no image
      };

      addRecipe(newRecipe);
      Alert.alert('Success', 'Recipe added!');
      router.back();
    } catch (err: any) {
      console.error('Failed to extract recipe:', err);
      Alert.alert('Error', 'Failed to extract recipe from URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ marginBottom: 12 }}>Paste a recipe page URL to add it:</Text>
      <TextInput
        value={inputUrl}
        onChangeText={setInputUrl}
        placeholder="https://www.bbcgoodfood.com/recipes/chicken-tikka-masala"
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 16 }}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title={loading ? 'Adding...' : 'Add Recipe from URL'} onPress={handleAddFromUrl} disabled={loading} />
    </ScrollView>
  );
}
