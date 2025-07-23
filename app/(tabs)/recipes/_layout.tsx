import { Stack } from 'expo-router';

export default function RecipesLayout() {


  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* index.tsx and [id].tsx will automatically be picked up */}
      </Stack>
    </>
  );
}
