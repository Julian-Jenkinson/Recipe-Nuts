import { Feather } from '@expo/vector-icons';
import { Input, InputField, InputSlot } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useRecipeStore } from '../../../stores/useRecipeStore';
import theme from '../../../theme';
import { downloadAndStoreImage } from '../../../utils/downloadAndStoreImage';

export default function AddRecipeScreen() {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const router = useRouter();
  const [focused, setFocused] = React.useState(false);

  const handleImportAndSave = async () => {
    Keyboard.dismiss();

    if (!inputUrl.trim()) {
      Alert.alert('Missing URL', 'Please enter a recipe URL.');
      return;
    }

    setLoading(true);

    try {
      // ✅ 1. Fetch recipe data
      const response = await fetch(
        `https://recipe-extractor-api.fly.dev/extract?url=${encodeURIComponent(inputUrl)}`
      );
      if (!response.ok) throw new Error('Invalid response from API');

      const data = await response.json();

      if (!data.title || !data.ingredients?.length || !data.instructions?.length) {
        throw new Error('Incomplete recipe data');
      }

      // ✅ 2. Download image (still part of ONE loading phase)
      let localImageUri = '';
      if (data.image) {
        localImageUri = (await downloadAndStoreImage(data.image)) || '';
      }

      // ✅ 3. Build recipe
      const newRecipe = {
        id: `recipe-${Date.now()}`,
        title: data.title,
        ingredients: Array.isArray(data.ingredients) ? data.ingredients.map(String) : [],
        instructions: Array.isArray(data.instructions) ? data.instructions.map(String) : [],
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

      // ✅ 4. Save recipe
      addRecipe(newRecipe);

      // ✅ 5. Reset input
      setInputUrl('');

      // ✅ 6. Navigate back *after everything is done*
      router.back();

      // ✅ 7. Show quick success toast/alert AFTER navigation
      setTimeout(() => {
        Alert.alert('Success', 'Recipe imported and saved!');
      }, 300); // tiny delay to avoid blocking transition

    } catch (err: any) {
      console.error('Import error:', err);
      Alert.alert('Error', 'Failed to import recipe from URL.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Recipe</Text>
        
        <Text style={styles.text}>
          Copy and paste a recipe link here to extract a recipe and save it to your collection.
        </Text>
        <Input
          style={styles.input}
          variant="rounded"
          size="md"
          borderRadius="$3xl"
          borderWidth={focused ? 2 : 0} // ✅ Add border when focused
          borderColor={focused ? '#999' : 'transparent'}
        >
          <InputField
            style={styles.inputField}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="Enter recipe URL"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {inputUrl.length > 0 && (
            <InputSlot pr={10}>
              <Pressable onPress={() => setInputUrl('')}>
                <Feather name="x" size={20} color="#888" />
              </Pressable>
            </InputSlot>
          )}
        </Input>
        {loading ? (
          <ActivityIndicator size="small" color="#000" style={{ marginTop: 20 }} />
        ) : (
          <Pressable onPress={handleImportAndSave} style={styles.buttonContainer}>
            <Feather name="download" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Import from URL</Text>
          </Pressable>
        )}


        {/* Button to create blank recipe */}
        <Text style={styles.orText}>OR</Text>
        <Pressable 
          onPress={() => router.push('/add/AddBlankRecipe')} 
          style={[styles.buttonContainer, { marginBottom: 30 }]}
        >
          <Feather name="edit-3" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Create New Recipe</Text>
        </Pressable>

        

      </View>
    </TouchableWithoutFeedback>
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
  orText: {
    fontSize: 18,
    fontFamily: 'Nunito-400',
    marginTop: 30,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    fontFamily: 'Nunito-400',
    backgroundColor: theme.colors.bgFocus,
    color: '#000',
  },
  inputField: {
    fontSize: 18,
    fontFamily: 'Nunito-400',
  },
  buttonContainer: {
    backgroundColor: theme.colors.cta,
    paddingVertical: 8,
    paddingHorizontal: 40,
    marginTop: 20,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Nunito-700',
    color: '#fff',
    textAlign: 'center',
  },
});
