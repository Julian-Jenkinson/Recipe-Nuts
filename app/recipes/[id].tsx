// app/recipes/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Recipe Details for ID: {id}</Text>
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
}
