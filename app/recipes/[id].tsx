import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRecipeStore } from '../../stores/useRecipeStore';

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

  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.map(String) : [];
  const notes = Array.isArray(recipe.notes) ? recipe.notes.map(String) : [];

  const imageUri = recipe.imageUrl?.length
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

      <Text style={styles.metaText}>Source: {recipe.source}</Text>
      <Text style={styles.metaText}>Prep Time: {recipe.prepTime || 'N/A'}</Text>
      <Text style={styles.metaText}>Cook Time: {recipe.cookTime || 'N/A'}</Text>
      <Text style={styles.metaText}>Difficulty: {recipe.difficulty || 'N/A'}</Text>
      <Text style={styles.metaText}>Serving Size: {recipe.servingSize || 'N/A'}</Text>
      <Text style={styles.metaText}>Category: {recipe.category || 'N/A'}</Text>
      <Text style={styles.metaText}>Favourite: {recipe.favourite ? 'Yes' : 'No'}</Text>

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
          <Text key={`step-${index}`} style={styles.instructionParagraph}>
            {step}
          </Text>
        ))
      ) : (
        <Text style={styles.itemText}>No instructions available.</Text>
      )}

      {notes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Notes:</Text>
          {notes.map((note, idx) => (
            <Text key={`note-${idx}`} style={styles.itemText}>
              • {note}
            </Text>
          ))}
        </>
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
  instructionParagraph: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  metaText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
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
