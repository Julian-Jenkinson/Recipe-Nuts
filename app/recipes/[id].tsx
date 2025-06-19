import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRecipeStore } from '../../stores/useRecipeStore';

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
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
            // Try to delete local image if it exists in FileSystem
            if (recipe.imageUrl.startsWith(FileSystem.documentDirectory!)) {
              try {
                await FileSystem.deleteAsync(recipe.imageUrl, { idempotent: true });
                console.log('Deleted image file:', recipe.imageUrl);
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
      <Image source={{ uri: recipe.imageUrl }} style={styles.image} resizeMode="cover" />

      <Text style={styles.sectionTitle}>Ingredients:</Text>
      {recipe.ingredients.map((item, index) => (
        <Text key={`ing-${index}`} style={styles.itemText}>• {item}</Text>
      ))}

      <Text style={styles.sectionTitle}>Instructions:</Text>
      {recipe.instructions.map((step, index) => (
        <Text key={`step-${index}`} style={styles.itemText}>{index + 1}. {step}</Text>
      ))}

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
