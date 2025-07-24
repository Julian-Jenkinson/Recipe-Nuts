import { Stack } from 'expo-router';

export default function AddLayout() {
  
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* index.tsx and other files will automatically be picked up */}
      </Stack>
    </>
  );
}
