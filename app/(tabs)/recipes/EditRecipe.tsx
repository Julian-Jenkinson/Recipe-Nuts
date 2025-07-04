import { Feather } from '@expo/vector-icons';
import { Box, HStack, Image, Pressable, Text } from '@gluestack-ui/themed';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecipeStore } from '../../../stores/useRecipeStore';
import theme from '../../../theme';

export default function EditRecipe() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);

  const getRecipeById = useRecipeStore((state) => state.getRecipeById);
  const updateRecipe = useRecipeStore((state) => state.updateRecipe);
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);

  const [draftRecipe, setDraftRecipe] = useState(() => getEmptyRecipe());

  function getEmptyRecipe() {
    return {
      id: '',
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
    };
  }

  useFocusEffect(
    useCallback(() => {
      if (id) {
        const recipe = getRecipeById(id);
        if (recipe) {
          setDraftRecipe({
            ...recipe,
            ingredients: Array.isArray(recipe.ingredients)
              ? recipe.ingredients.join('\n')
              : '',
            instructions: Array.isArray(recipe.instructions)
              ? recipe.instructions.join('\n\n')
              : '',
            notes: Array.isArray(recipe.notes) ? recipe.notes.join('\n') : '',
          });
        } else {
          Alert.alert('Recipe not found');
          router.back();
        }
      } else {
        Alert.alert('Invalid recipe ID');
        router.back();
      }
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [id])
  );

  const handleSave = () => {
    if (!draftRecipe.title.trim()) {
      Alert.alert('Validation', 'Title is required.');
      return;
    }

    const updatedRecipe = {
      ...draftRecipe,
      ingredients: draftRecipe.ingredients
        .split('\n')
        .map((i) => i.trim())
        .filter(Boolean),
      instructions: draftRecipe.instructions
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean),
      notes: draftRecipe.notes
        ? draftRecipe.notes.split('\n').map((n) => n.trim()).filter(Boolean)
        : [],
    };

    updateRecipe(updatedRecipe);
    Alert.alert('Success', 'Recipe updated!');
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      {/* Header */}
      <HStack 
        pl={6} pr={18} py={14} 
        justifyContent="space-between" 
        alignItems="center"
        bg={theme.colors.bg}  
      >
        <Pressable onPress={() => router.push(`/recipes/${draftRecipe.id}`)}>
          <Feather name="chevron-left" size={32} color="#333" />
        </Pressable>
        <Box flexDirection="row">
          <Pressable>
            <Feather name="trash-2" size={22} color="#C1121F" />
          </Pressable>
        </Box>
      </HStack>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.headerText]}>
          Edit Recipe
        </Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          value={draftRecipe.title}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, title: text })}
          style={styles.largeInput}
        />

        {draftRecipe.imageUrl ? (
          <Image
            source={{ uri: draftRecipe.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}

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

         {/* Buttons in HStack */}
        <HStack justifyContent="center" space={"md"} style={{ marginTop: 16 }}>
          <Pressable style={styles.cancelButton} onPress={handleCancel} >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSave} >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </HStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: theme.colors.bg,
    //backgroundColor: 'white',
  },
  headerText: {
    fontFamily: 'Nunito-800',
    fontSize: 24,
    color: '#333',
  },
  label: {
    fontFamily: 'Nunito-600',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    color: '#000',
  },
  input: {
    fontFamily: 'Nunito-400',
    height: 40,
    borderWidth: 0,
    borderColor: '#ddd',
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  largeInput: {
    fontFamily: 'Nunito-700',
    height: 50,
    borderWidth: 0,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    fontSize: 18,
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  textArea: {
    fontFamily: 'Nunito-400',
    borderWidth: 0,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    color: '#000',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.cta,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Nunito-700',
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#888', // a red tone for cancel (instead of default blue)
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Nunito-700',
    color: '#fff',
    fontSize: 16,
  },
});
