import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRecipeStore } from '../../stores/useRecipeStore';

type InstructionStep = {
  text?: string;
  [key: string]: any;
};

type InstructionSection = {
  itemListElement?: InstructionStep[];
  [key: string]: any;
};

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Invalid Recipe ID</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const recipe = useRecipeStore((state) => state.getRecipeById(id));
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Recipe not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const rawInstructions = recipe.instructions;

  let instructions: string[] = [];

  // Helper: extract text recursively from sections and steps
  const extractInstructionText = (input: any): string[] => {
    if (Array.isArray(input)) {
      // Array can contain strings or objects
      return input.flatMap(item => extractInstructionText(item));
    } else if (typeof input === 'string') {
      return input.trim() ? [input.trim()] : [];
    } else if (typeof input === 'object' && input !== null) {
      // Check for HowToSection or similar structure
      if (Array.isArray(input.itemListElement)) {
        return extractInstructionText(input.itemListElement);
      }
      // Fallback to .text property if exists
      if (typeof input.text === 'string' && input.text.trim()) {
        return [input.text.trim()];
      }
      // If no text found, return empty
      return [];
    }
    return [];
  };

  // Use extraction helper on raw instructions
  instructions = extractInstructionText(rawInstructions);

  // Ingredients fallback
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.map(String) : [];

  const imageUri = recipe.imageUrl && recipe.imageUrl.length > 0
    ? recipe.imageUrl
    : 'https://via.placeholder.com/400';

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (imageUri.startsWith(FileSystem.documentDirectory!)) {
              try {
                await FileSystem.deleteAsync(imageUri, { idempotent: true });
                console.log('Deleted image file:', imageUri);
              } catch (err) {
                console.warn('Failed to delete image:', err);
              }
            }

            deleteRecipe(recipe.id);
            router.back();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

      <Text style={styles.sectionTitle}>Ingredients:</Text>
      {ingredients.length > 0 ? (
        ingredients.map((item, index) => (
          <Text key={`ing-${index}`} style={styles.itemText}>
            • {item}
          </Text>
        ))
      ) : (
        <Text style={styles.itemText}>No ingredients available.</Text>
      )}

      <Text style={styles.sectionTitle}>Instructions:</Text>
      {instructions.length > 0 ? (
        instructions.map((step, index) => (
          <Text key={`step-${index}`} style={styles.itemText}>
            {index + 1}. {step}
          </Text>
        ))
      ) : (
        <Text style={styles.itemText}>No instructions available.</Text>
      )}

      <View style={styles.buttonRow}>
        <Button title="Go Back" onPress={() => router.back()} />
        <Button title="Delete" onPress={handleDelete} color="#ff4444" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});
