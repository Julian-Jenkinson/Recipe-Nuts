import { StatusBar } from '@gluestack-ui/themed';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import theme from '../../../theme';

export default function RecipesLayout() {

  useEffect(() => {
    //NavigationBar.setBackgroundColorAsync(theme.colors.bg);
    NavigationBar.setButtonStyleAsync('dark'); // Optional: dark icons on light bg
  }, []);


  return (
    <>
      <StatusBar
        backgroundColor={theme.colors.bg}
        barStyle="dark-content"
      />
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
