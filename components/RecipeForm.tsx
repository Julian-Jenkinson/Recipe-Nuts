import { Feather } from "@expo/vector-icons";
import {
  Box,
  HStack,
  Image,
  Pressable,
  Text,
} from "@gluestack-ui/themed";
import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Recipe } from "../stores/useRecipeStore"; // ✅ only 1 level up
import theme from "../theme"; // ✅ only 1 level up

export type RecipeFormMode = "edit" | "create";

interface RecipeFormProps {
  initialRecipe: Partial<Recipe>;         // comes from store or blank
  onSubmit: (recipe: Recipe) => void;     //always returns a full Recipe
  onCancel: () => void;
  mode?: RecipeFormMode;
}

// Form-friendly version of Recipe (strings for multi-line fields)
type RecipeFormDraft = Omit<Recipe, "ingredients" | "instructions" | "notes"> & {
  ingredients: string;
  instructions: string;
  notes: string;
};

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialRecipe,
  onSubmit,
  onCancel,
  mode = "create",
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Convert store recipe (arrays) into form-friendly draft (strings)
  const [draftRecipe, setDraftRecipe] = useState<RecipeFormDraft>(() => ({
    id: initialRecipe.id ?? "",
    title: initialRecipe.title ?? "",
    imageUrl: initialRecipe.imageUrl ?? "",
    source: initialRecipe.source ?? "",
    category: initialRecipe.category ?? "",
    difficulty: initialRecipe.difficulty ?? "",
    servingSize: initialRecipe.servingSize ?? "",
    prepTime: initialRecipe.prepTime ?? "",
    cookTime: initialRecipe.cookTime ?? "",
    favourite: initialRecipe.favourite ?? false,
    ingredients: Array.isArray(initialRecipe.ingredients)
      ? initialRecipe.ingredients.join("\n")
      : (initialRecipe.ingredients as unknown as string) ?? "",
    instructions: Array.isArray(initialRecipe.instructions)
      ? initialRecipe.instructions.join("\n\n")
      : (initialRecipe.instructions as unknown as string) ?? "",
    notes: Array.isArray(initialRecipe.notes)
      ? initialRecipe.notes.join("\n")
      : (initialRecipe.notes as unknown as string) ?? "",
  }));

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const handleSave = () => {
    if (!draftRecipe.title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }

    // Convert back into a proper Recipe (arrays for multi-fields)
    const finalRecipe: Recipe = {
      id: draftRecipe.id || String(Date.now()), // generate id if missing
      title: draftRecipe.title,
      imageUrl: draftRecipe.imageUrl,
      source: draftRecipe.source,
      category: draftRecipe.category,
      difficulty: draftRecipe.difficulty,
      servingSize: draftRecipe.servingSize,
      prepTime: draftRecipe.prepTime,
      cookTime: draftRecipe.cookTime,
      favourite: draftRecipe.favourite,
      ingredients: draftRecipe.ingredients
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean),
      instructions: draftRecipe.instructions
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean),
      notes: draftRecipe.notes
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean),
    };

    onSubmit(finalRecipe);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
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
        <Text style={styles.headerText}>
          {mode === "edit" ? "Edit Recipe" : "New Recipe"}
        </Text>
        <Box flexDirection="row" />
      </HStack>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={draftRecipe.title}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, title: text })
          }
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

        <Text style={styles.label}>Source</Text>
        <TextInput
          value={draftRecipe.source}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, source: text })
          }
          style={styles.input}
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          value={draftRecipe.category}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, category: text })
          }
          style={styles.input}
        />

        <Text style={styles.label}>Difficulty</Text>
        <TextInput
          value={draftRecipe.difficulty}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, difficulty: text })
          }
          style={styles.input}
        />

        <Text style={styles.label}>Serving Size</Text>
        <TextInput
          value={draftRecipe.servingSize}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, servingSize: text })
          }
          style={styles.input}
        />

        <Text style={styles.label}>Prep Time</Text>
        <TextInput
          value={draftRecipe.prepTime}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, prepTime: text })
          }
          style={styles.input}
        />

        <Text style={styles.label}>Cook Time</Text>
        <TextInput
          value={draftRecipe.cookTime}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, cookTime: text })
          }
          style={styles.input}
        />

        <Text style={styles.label}>Ingredients</Text>
        <TextInput
          value={draftRecipe.ingredients}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, ingredients: text })
          }
          style={styles.textArea}
          multiline
        />

        <Text style={styles.label}>Instructions</Text>
        <TextInput
          value={draftRecipe.instructions}
          onChangeText={(text) =>
            setDraftRecipe({ ...draftRecipe, instructions: text })
          }
          style={styles.textArea}
          multiline
        />

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
        <HStack justifyContent="center" space={"md"} style={{ marginTop: 16 }}>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {mode === "edit" ? "Save Changes" : "Create Recipe"}
            </Text>
          </Pressable>
        </HStack>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: theme.colors.bg },
  headerText: { fontFamily: "Nunito-800", fontSize: 20, color: "#333" },
  label: {
    fontFamily: "Nunito-600",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    color: "#000",
  },
  input: {
    fontFamily: "Nunito-400",
    height: 40,
    borderWidth: 0,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#000",
  },
  largeInput: {
    fontFamily: "Nunito-700",
    height: 50,
    paddingHorizontal: 10,
    fontSize: 18,
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#000",
  },
  textArea: {
    fontFamily: "Nunito-400",
    padding: 10,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    color: "#000",
  },
  image: { width: "100%", height: 200, borderRadius: 8, marginTop: 16 },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.cta,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { fontFamily: "Nunito-700", color: "#fff", fontSize: 16 },
  cancelButton: {
    flex: 1,
    backgroundColor: "#888",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: { fontFamily: "Nunito-700", color: "#fff", fontSize: 16 },
});
