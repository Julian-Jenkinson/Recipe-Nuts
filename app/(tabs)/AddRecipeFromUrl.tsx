import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useRecipeStore } from '../../stores/useRecipeStore';
import theme from '../../theme';
import { downloadAndStoreImage } from '../../utils/downloadAndStoreImage';

export default function AddRecipeFromUrl() {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const router = useRouter();

  const handleImportAndSave = async () => {
    if (!inputUrl.trim()) {
      Alert.alert('Missing URL', 'Please enter a recipe URL.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://recipe-extractor-api.fly.dev/extract?url=${encodeURIComponent(inputUrl)}`
      );
      if (!response.ok) throw new Error('Invalid response from API');

      const data = await response.json();

      if (!data.title || !data.ingredients?.length || !data.instructions?.length) {
        throw new Error('Incomplete recipe data');
      }

      let localImageUri = '';
      if (data.image) {
        localImageUri = (await downloadAndStoreImage(data.image)) || '';
      }

      // Build the new recipe object
      const newRecipe = {
        id: `recipe-${Date.now()}`,
        title: data.title,
        ingredients: Array.isArray(data.ingredients)
          ? data.ingredients.map(String)
          : [],
        instructions: Array.isArray(data.instructions)
          ? data.instructions.map(String)
          : [],
        imageUrl: localImageUri,
        source: data.source || '',
        category: data.category || '',
        notes: Array.isArray(data.notes) ? data.notes.map(String) : [],
        difficulty: data.difficulty || '',
        cookTime: data.cookTime || '',
        prepTime: data.prepTime || '',
        servingSize: data.servingSize || '',
        favourite: false,
      };

      addRecipe(newRecipe);
      Alert.alert('Success', 'Recipe imported and saved!');
      router.back();
    } catch (err: any) {
      console.error('Import error:', err);
      Alert.alert('Error', 'Failed to import recipe from URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Recipe</Text>
      <Text style={styles.text}>Copy and paste a recipe link here to extract a recipe and save it to your collection.</Text>
      <TextInput
        value={inputUrl}
        onChangeText={setInputUrl}
        placeholder="Enter recipe URL"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator size="small" color="#000" style={{ marginTop: 20 }} />
      ) : (
        <Pressable onPress={handleImportAndSave} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Import and Save</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: theme.colors.bg,
    
  },
  title: {
    fontSize: 22,
    fontFamily: 'Nunito-700',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Nunito-400',
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    fontFamily: 'Nunito-400',
    borderWidth: 1,
    borderColor: theme.colors.bgFocus,
    backgroundColor: theme.colors.bgFocus,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
  },
  buttonContainer: {
    backgroundColor: theme.colors.cta, // a nice green
    paddingVertical: 8,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf:'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Nunito-700',
    color: '#fff',
    textAlign: 'center',
  },
  
});
