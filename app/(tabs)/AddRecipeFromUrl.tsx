import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { downloadAndStoreImage } from '../../utils/downloadAndStoreImage';

export default function AddRecipeFromUrl() {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftRecipe, setDraftRecipe] = useState({
    id: `recipe-${Date.now()}`,
    title: '',
    ingredients: '',
    instructions: '',
    imageUrl: '',
    source: '',
    category: '',
    notes: '',
    difficulty: '',
    cookTime: '',
    prepTime: '',
    servingSize: '',
    favourite: false,
  });

  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const router = useRouter();

  const handleImport = async () => {
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

      let localImageUri = '';
      if (data.image) {
        localImageUri = await downloadAndStoreImage(data.image) || '';
      }

      setDraftRecipe({
        ...draftRecipe,
        title: data.title,
        ingredients: data.ingredients.join('\n'),
        instructions: data.instructions.join('\n\n'),
        imageUrl: localImageUri,
        source: data.source || '',
        category: data.category || '',
        notes: Array.isArray(data.notes) ? data.notes.join('\n') : '',
        difficulty: data.difficulty || '',
        cookTime: data.cookTime || '',
        prepTime: data.prepTime || '',
        servingSize: data.servingSize || '',
      });
    } catch (err: any) {
      console.error('Import error:', err);
      Alert.alert('Error', 'Failed to import recipe from URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!draftRecipe.title.trim()) {
      Alert.alert('Validation', 'Title is required.');
      return;
    }

    const newRecipe = {
      ...draftRecipe,
      ingredients: draftRecipe.ingredients
        .split('\n')
        .map((i) => i.trim())
        .filter((i) => i),
      instructions: draftRecipe.instructions
        .split(/\n{2,}/)  // split on double newlines or more = paragraphs
        .map((s) => s.trim())
        .filter((s) => s),
      notes: draftRecipe.notes
        ? draftRecipe.notes.split('\n').map((n) => n.trim()).filter((n) => n)
        : [],
    };

    addRecipe(newRecipe);
    Alert.alert('Success', 'Recipe added!');
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Import Recipe</Text>
      <TextInput
        value={inputUrl}
        onChangeText={setInputUrl}
        placeholder="https://example.com/recipe"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title={loading ? 'Importing...' : 'Import from URL'} onPress={handleImport} disabled={loading} />

      <View style={{ marginTop: 24 }}>

        {draftRecipe.imageUrl ? (
          <Image
            source={{ uri: draftRecipe.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}
        
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={draftRecipe.title}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, title: text })}
          style={styles.largeInput}
        />

        <Text style={styles.label}>Source</Text>
        <TextInput
          value={draftRecipe.source}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, source: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          value={draftRecipe.category}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, category: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Difficulty</Text>
        <TextInput
          value={draftRecipe.difficulty}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, difficulty: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Serving Size</Text>
        <TextInput
          value={draftRecipe.servingSize}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, servingSize: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Prep Time</Text>
        <TextInput
          value={draftRecipe.prepTime}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, prepTime: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Cook Time</Text>
        <TextInput
          value={draftRecipe.cookTime}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, cookTime: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Ingredients</Text>
        <TextInput
          value={draftRecipe.ingredients}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, ingredients: text })}
          style={styles.textArea}
          multiline
        />

        <Text style={styles.label}>Instructions</Text>
        <TextInput
          value={draftRecipe.instructions}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, instructions: text })}
          style={styles.textArea}
          multiline
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          value={draftRecipe.notes}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, notes: text })}
          style={styles.textArea}
          multiline
        />

        <View style={{ marginVertical: 20 }}>
          <Button title="Save Recipe" onPress={handleSave} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
  },
  largeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    fontSize: 18,
    borderRadius: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
});
