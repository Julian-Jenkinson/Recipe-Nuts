import { Feather } from '@expo/vector-icons';
import { Input, InputField, InputSlot, StatusBar } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { FreeTierLimitReached } from '../../components/FreeTierLimitReached';
import { useRecipeStore } from '../../stores/useRecipeStore';
import theme from '../../theme';
import { downloadAndStoreImage } from '../../utils/downloadAndStoreImage';

export default function AddRecipeScreen() {
  const recipes = useRecipeStore((state) => state.recipes);
  const isPro = useRecipeStore((state) => state.isPro);
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const router = useRouter();
  const [focused, setFocused] = React.useState(false);

  console.log('isPro:', isPro, 'recipes.length:', recipes.length);

  const handleImportAndSave = async () => {
    Keyboard.dismiss();

    if (!inputUrl.trim()) {
      Alert.alert('Missing URL', 'Please enter a recipe URL.');
      return;
    }

    setLoading(true);

    try {
      // Fetch recipe data
      const response = await fetch(
        `https://recipe-extractor-api.fly.dev/extract?url=${encodeURIComponent(inputUrl)}`
      );
      if (!response.ok) {
        console.warn('Invalid response from API');
        Alert.alert('Error', 'Could not fetch recipe from the server.');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!data.title || !data.ingredients?.length || !data.instructions?.length) {
        throw new Error('Incomplete recipe data');
      }

      // Download image (still part of ONE loading phase)
      let localImageUri = '';
      if (data.image) {
        localImageUri = (await downloadAndStoreImage(data.image)) || '';
      }

      // Build recipe
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

      // Save recipe
      addRecipe(newRecipe);

      // Reset input
      setInputUrl('');
      // Show toast, navigate back to recipes and prompt for review
      Alert.alert(
        'Success', 
        'Recipe imported and saved!', 
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/recipes');
              setTimeout(() => {
                triggerReviewIfNeeded();
              }, 1500); // 1.2s delay gives user time to see the imported recipe
            }
          },
        ]
      );

      
      
      // ✅ 6. Navigate back *after everything is done*
      //router.replace('/recipes');
      
      // ✅ 7. Show quick success toast/alert AFTER navigation
      //setTimeout(() => {
       // Alert.alert(
        //  'Success',
        //  'Recipe imported and saved!',
        //  [
        //    {
        //      text: 'OK',
        //      onPress: () => {
        //        // NOW the alert is gone → trigger review
        //        triggerReviewIfNeeded();
        //      }
        //    }
        //  ]
        //);
      //}, 1000);// tiny delay to avoid blocking transition

    } catch (err: any) {
      console.error('Import error:', err);
      Alert.alert('Error', 'Failed to import recipe from URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlank = () => {
    router.push('/add/AddBlankRecipe');
  };

  const hasReachedLimit = !isPro && recipes.length >= 10;
  if (hasReachedLimit) {
    return (
      <FreeTierLimitReached 
        currentCount={recipes.length} 
        maxFree={10} 
        onUpgrade={() => router.push('/menu')} // navigate to menu/upgrade - change this later to specific screen after payment
      />
    );
  }

  const triggerReviewIfNeeded = async () => {
    try {
      // Optional: add your own logic, e.g. only every 5 imports
      // if (!shouldAskForReview()) return;

      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
      }
    } catch (err) {
      console.log("Review prompt error:", err);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      
      <View style={styles.container}>
        
        <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />
        
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/recipes/')} style={styles.backButton}>
            <Feather name="chevron-left" size={32} color="#333" />
          </Pressable>
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.title}>Add Recipe</Text>
        
          <Text style={styles.text}>
            Copy and paste a recipe link here to extract a recipe and save it to your collection.
          </Text>
          <Input
            style={styles.input}
            variant="rounded"
            size="md"
            borderRadius="$2xl"
            borderWidth={focused ? 2 : 1} // ✅ Add border when focused
            borderColor={focused ? '#888' : '#ddd'}
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
          <Pressable
            onPress={handleImportAndSave}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? theme.colors.cta : theme.colors.cta },
              loading && { opacity: 0.7 },
              { justifyContent: "center", alignItems: "center" }, // keep center baseline
            ]}
          >
            {loading && (
              <ActivityIndicator
                color="#fff"
                style={{
                  position: "absolute", // ignore text layout
                  alignSelf: "center",  // force center
                }}
              />
            )}
            <Text style={[styles.buttonText, loading && { opacity: 0 }]}>
              Import
            </Text>
          </Pressable>
        </View>
      </View>  
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.bg,
    paddingBottom:100,
  },
  header: {
    paddingTop:30,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    padding: 4,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'body-700',
  },
  title: {
    fontSize: 22,
    fontFamily: 'body-700',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    fontFamily: 'body-400',
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  orText: {
    fontSize: 18,
    fontFamily: 'body-400',
    marginTop: 30,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    fontFamily: 'body-400',
    backgroundColor: theme.colors.bgFocus,
    color: '#000',

  },
  inputField: {
    fontSize: 18,
    fontFamily: 'body-400',
  },
  button: {
    backgroundColor: theme.colors.cta,
    paddingVertical: 8,
    paddingHorizontal: 40,
    marginTop: 20,
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'body-700',
    color: '#fff',
    textAlign: 'center',
  },
});
