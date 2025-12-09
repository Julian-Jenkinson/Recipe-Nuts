import { Feather } from "@expo/vector-icons";
import {
  Box,
  HStack,
  Image,
  Pressable,
  StatusBar,
  Text
} from "@gluestack-ui/themed";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, TextInput } from "react-native";
import { KeyboardAwareScrollView, KeyboardAwareScrollViewRef } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Recipe } from "../stores/useRecipeStore";
import theme from "../theme";

// ✅ Fallback placeholder when no valid image
const fallbackImage = require("../assets/images/error.png");

export type RecipeFormMode = "edit" | "create";

interface RecipeFormProps {
  initialRecipe: Partial<Recipe>;         
  onSubmit: (recipe: Recipe) => void;    
  onCancel: () => void;
  mode?: RecipeFormMode;
}

// Form-friendly version of Recipe
type RecipeFormDraft = Omit<Recipe, "ingredients" | "instructions" | "notes"> & {
  ingredients: string;
  instructions: string;
  notes: string;
};

// ✅ Helper: Only consider URLs starting with http(s) or file:// valid for <Image />
const isValidImageUrl = (url?: string) => {
  if (!url) return false;
  return url.startsWith("http") || url.startsWith("file");
};

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialRecipe,
  onSubmit,
  onCancel,
  mode = "create",
}) => {
  
  const scrollViewRef = useRef<KeyboardAwareScrollViewRef>(null);

  // ✅ Form-friendly draft state
  const [draftRecipe, setDraftRecipe] = useState<RecipeFormDraft>(() => ({
    id: initialRecipe.id ?? "",
    title: initialRecipe.title ?? "",
    imageUrl: initialRecipe.imageUrl ?? "",      // ✅ Only actual image URL
    source: initialRecipe.source ?? "",          // ✅ Website/source (not for <Image />)
    category: initialRecipe.category ?? "",
    difficulty: initialRecipe.difficulty ?? "",
    servingSize: initialRecipe.servingSize ?? "",
    prepTime: initialRecipe.prepTime ?? "",
    cookTime: initialRecipe.cookTime ?? "",
    favourite: initialRecipe.favourite ?? false,
    ingredients: Array.isArray(initialRecipe.ingredients)
      ? initialRecipe.ingredients.join("\n")
      : (initialRecipe.ingredients as unknown as string) || "",
    instructions: Array.isArray(initialRecipe.instructions)
      ? initialRecipe.instructions.join("\n\n")
      : (initialRecipe.instructions as unknown as string) || "",
    notes: Array.isArray(initialRecipe.notes)
      ? initialRecipe.notes.join("\n")
      : (initialRecipe.notes as unknown as string) || "",
  }));

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const handleSave = () => {
    if (!draftRecipe.title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }

    // ✅ Always produce a safe Recipe
    const finalRecipe: Recipe = {
      id: draftRecipe.id || `recipe-${Date.now()}`,
      title: draftRecipe.title.trim(),
      imageUrl: draftRecipe.imageUrl?.trim() || "",   // ✅ only actual image url
      source: draftRecipe.source?.trim() || "",       // ✅ just stored as text
      category: draftRecipe.category?.trim() || "",
      difficulty: draftRecipe.difficulty?.trim() || "",
      servingSize: draftRecipe.servingSize?.trim() || "",
      prepTime: draftRecipe.prepTime?.trim() || "",
      cookTime: draftRecipe.cookTime?.trim() || "",
      favourite: draftRecipe.favourite ?? false,
      ingredients: draftRecipe.ingredients
        ? draftRecipe.ingredients
            .split("\n")
            .map((i) => i.trim())
            .filter(Boolean)
        : [],
      instructions: draftRecipe.instructions
        ? draftRecipe.instructions
            .split(/\n{2,}/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      notes: draftRecipe.notes
        ? draftRecipe.notes
            .split("\n")
            .map((n) => n.trim())
            .filter(Boolean)
        : [],
    };

    onSubmit(finalRecipe);
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
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />
      {/* Header */}
      <HStack
        pl={6}
        pr={18}
        py={14}
        justifyContent="space-between"
        alignItems="center"
        bg={theme.colors.bg}
      >
        <Pressable onPress={onCancel}>
          <Feather name="chevron-left" size={32} color="#333" />
        </Pressable>
        
        
        <Box flexDirection="row" alignItems='center'>
          <Pressable onPress={handleSave} style={{ marginRight: 10 }}>
            <Feather name="save" size={28} color={theme.colors.cta}
              style={{ marginTop: 2 }} 
            />
          </Pressable>
        </Box>
      </HStack>

      <KeyboardAwareScrollView
      ref={scrollViewRef}
        contentContainerStyle={styles.container}
        //bottomOffset={0}
        keyboardShouldPersistTaps="handled"
        //enabled
        //extraKeyboardSpace={0}
        scrollEventThrottle={16}
      >
        <Text style={styles.headerText}>
          {mode === "edit" ? "Edit Recipe" : "New Recipe"}
        </Text>
        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={draftRecipe.title}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, title: text })
          }
          style={styles.largeInput}
        />

        {/* ✅ Only imageUrl goes to <Image /> */}
        {/* Image or Placeholder */}
        {isValidImageUrl(draftRecipe.imageUrl) ? (
          <Image
            source={{ uri: draftRecipe.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`Image of ${draftRecipe.title || "placeholder"}`}
            alt={`Image of ${draftRecipe.title || "placeholder"}`}
          />
        ) : (
          <Box
            style={styles.imagePlaceholder}
            alignItems="center"
            justifyContent="center"
          >
            <Feather name="image" size={48} color="#ccc" />
          </Box>
        )}

        {/* Buttons under image */}
        <HStack justifyContent="center" mt={12} gap={12}>
          <Pressable style={styles.cameraButton} onPress={pickImage}>
            <HStack alignItems="center" gap={8}>
              <Text style={styles.cameraButtonText}>Choose Image</Text>
              <Feather name="upload" size={24} color='theme.colors.text1' />
            </HStack>
          </Pressable>

          <Pressable style={styles.cameraButton} onPress={takePhoto}>
            <HStack alignItems="center" gap={8}>
              <Text style={styles.cameraButtonText}>Take Photo</Text>
              <Feather name="camera" size={24} color='theme.colors.text1' />
            </HStack>
          </Pressable>
        </HStack>


        {/* Source (just text info, never used as image) */}
        <Text style={styles.label}>Author</Text>
        <TextInput
          value={draftRecipe.source}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, source: text })
          }
          style={styles.input}
          placeholder="e.g. https://www.tasty.com/pasta"
        />

        {/* Category 
        <Text style={styles.label}>Category</Text>
        <TextInput
          value={draftRecipe.category}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, category: text })
          }
          style={styles.input}
        />
        */}

        {/* Difficulty */}
        <Text style={styles.label}>Difficulty</Text>
        <TextInput
          value={draftRecipe.difficulty}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, difficulty: text })
          }
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

        {/* Ingredients */}
        <Text style={styles.label}>Ingredients</Text>
        <TextInput
          value={draftRecipe.ingredients}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, ingredients: text })
          }
          style={styles.textArea}
          multiline
        />

        {/* Instructions */}
        <Text style={styles.label}>Instructions</Text>
        <TextInput
          value={draftRecipe.instructions}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, instructions: text })
          }
          style={styles.textArea}
          multiline
        />

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          value={draftRecipe.notes}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, notes: text })
          }
          style={styles.textArea}
          multiline
        />

        {/* Buttons */}
        <HStack justifyContent="center" space={"md"} style={{ marginTop: 16, marginBottom:40, }}>
          
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {mode === "edit" ? "Save Changes" : "Create Recipe"}
            </Text>
          </Pressable>
        </HStack>
      </KeyboardAwareScrollView>  
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    borderStyle: 'dashed',
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

  imagePlaceholder: {
  width: '100%',
  height: 220,
  marginTop:24,
  borderRadius: 12,
  backgroundColor: '#f7f7f7',
  borderWidth: .7,
  borderColor: '#ddd',
  alignItems: 'center',
  justifyContent: 'center',
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
