import { Feather } from '@expo/vector-icons';
import { Box, HStack, Image, Pressable, StatusBar, Text } from '@gluestack-ui/themed';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput
} from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDisplayIngredients } from '../../domain/ingredients/ingredientDisplayAdapter';
import { migrateLegacyIngredientsToDetails } from '../../domain/ingredients/ingredientMigration';
import { useRecipeStore } from '../../stores/useRecipeStore';
import theme from '../../theme';



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
            ingredients: getDisplayIngredients(recipe).join('\n'),
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

    const ingredientLines = draftRecipe.ingredients
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);
    const ingredientDetails = migrateLegacyIngredientsToDetails(ingredientLines);

    const updatedRecipe = {
      ...draftRecipe,
      ingredients: ingredientDetails
        .map((detail) => detail.raw?.trim() || detail.ingredient?.trim() || '')
        .filter(Boolean),
      ingredientDetails,
      instructions: draftRecipe.instructions
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean),
      notes: draftRecipe.notes
        ? draftRecipe.notes.split('\n').map((n) => n.trim()).filter(Boolean)
        : [],
    };

    updateRecipe(updatedRecipe);
    //Alert.alert('Success', 'Recipe updated!');
    //router.back();
    Alert.alert('Success', 'Recipe updated!', [
            {
              text: 'OK',
              onPress: () => router.replace('/recipes'),
            },
          ]);
  };

  const handleCancel = () => {
    router.back();
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
  
    if (!result.canceled) {
      setDraftRecipe({
        ...draftRecipe,
        imageUrl: result.assets[0].uri,
      });
    }
  };
  
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the camera is required.');
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      setDraftRecipe({ ...draftRecipe, imageUrl: result.assets[0].uri });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />
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
        <Box flexDirection="row" alignItems='center'>
          <Pressable onPress={handleSave}>
            <Feather name="save" size={28} color={theme.colors.cta}
              style={{ marginTop: 2 }} 
            />
          </Pressable>
        </Box>
      </HStack>

      
      
      <KeyboardAwareScrollView
        //ref={scrollViewRef}
        contentContainerStyle={styles.container}
        //bottomInset={24}  // adjust for bottom buttons if needed
        //extraOffset={50}
        //animated
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
            accessibilityLabel={`Image of ${draftRecipe.title}`}
            alt={`Image of ${draftRecipe.title}`} 
          />
        ) : null}

        {/* Buttons under image */}
        <HStack justifyContent="center" mt={12} gap={12}>
          <Pressable style={styles.cameraButton} onPress={pickImage}>
            <HStack alignItems="center" gap={8}>
              <Text style={styles.cameraButtonText}>Choose Image</Text>
              <Feather name="upload" size={22} color='theme.colors.text1' />
            </HStack>
          </Pressable>
        
          <Pressable style={styles.cameraButton} onPress={takePhoto}>
            <HStack alignItems="center" gap={8}>
              <Text style={styles.cameraButtonText}>Take Photo</Text>
              <Feather name="camera" size={22} color='theme.colors.text1' />
            </HStack>
          </Pressable>
        </HStack>



        <Text style={styles.label}>Author</Text>
        <TextInput
          value={draftRecipe.source}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, source: text })}
          style={styles.input}
        />

        {/*
        <Text style={styles.label}>Category</Text>
        <TextInput
          value={draftRecipe.category}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, category: text })}
          style={styles.input}
        />
        */}

        <Text style={styles.label}>Difficulty</Text>
        <TextInput
          value={draftRecipe.difficulty}
          onChangeText={(text) => setDraftRecipe({ ...draftRecipe, difficulty: text })}
          style={styles.input}
        />

        <HStack gap={24} flexWrap="wrap">
          {/* Serving Size */}
          <Box flex={1}>
            <Text style={styles.label}>Serving Size</Text>
            <TextInput
              value={draftRecipe.servingSize}
              onChangeText={(text) =>
                setDraftRecipe({ ...draftRecipe, servingSize: text })
              }
              style={styles.input}
              //placeholder="e.g. 4"
              keyboardType="numeric"
            />
          </Box>

          {/* Prep Time */}
          <Box flex={1}>
            <Text style={styles.label}>Prep Time</Text>
            <TextInput
              value={draftRecipe.prepTime}
              onChangeText={(text) =>
                setDraftRecipe({ ...draftRecipe, prepTime: text })
              }
              style={styles.input}
              //placeholder="e.g. 30"
              keyboardType="numeric"
            />
          </Box>

          {/* Cook Time */}
          <Box flex={1}>
            <Text style={styles.label}>Cook Time</Text>
            <TextInput
              value={draftRecipe.cookTime}
              onChangeText={(text) =>
                setDraftRecipe({ ...draftRecipe, cookTime: text })
              }
              style={styles.input}
              //placeholder="e.g. 45"
              keyboardType="numeric"
            />
          </Box>
        </HStack>
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
          style={styles.textAreaNotes}
          multiline
        />

         {/* Buttons in HStack */}
        <HStack justifyContent="center" space={"md"} style={{ marginTop: 16, marginBottom: 26 }}>
          <Pressable style={styles.saveButton} onPress={handleSave} >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </HStack>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, //play with this flexgrow etc
    paddingHorizontal: 16,
    backgroundColor: theme.colors.bg,
  },
  headerText: {
    fontFamily: 'heading-800',
    fontSize: 24,
    color: '#333',
  },
  label: {
    fontFamily: 'body-700',
    fontSize: 16,
    marginTop: 24,
    marginBottom: 8,
    color: '#000',
  },
  input: {
    fontFamily: 'body-400',
    fontSize: 16,
    height: 40,
    borderWidth: .7,
    borderColor: '#ddd',
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    color: '#000',
  },
  largeInput: {
    fontFamily: 'body-600',
    height: 50,
    borderWidth: .7,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    fontSize: 18,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    color: '#000',
  },
  textArea: {
    fontFamily: 'body-400',
    fontSize: 16,
    borderWidth: .7,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 12,
    //minHeight: 100,
    height: 250,
    textAlignVertical: 'top',
    backgroundColor: '#f7f7f7',
    color: '#000',
    lineHeight:28,
  },
  textAreaNotes: {
    fontFamily: 'body-400',
    fontSize: 16,
    borderWidth: .7,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 12,
    //minHeight: 100,
    height: 160,
    textAlignVertical: 'top',
    backgroundColor: '#f7f7f7',
    color: '#000',
    lineHeight:28,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
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
    fontFamily: 'body-700',
    color: '#fff',
    fontSize: 16,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  cameraButtonText: {
    color: theme.colors.text1,
    fontSize: 16,
    fontFamily: 'body-700',
  },
});
