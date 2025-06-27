// app/_layout.tsx
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    'Nunito-200': require('../assets/fonts/Nunito-ExtraLight.ttf'),
    'Nunito-300': require('../assets/fonts/Nunito-Light.ttf'),
    'Nunito-400': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-500': require('../assets/fonts/Nunito-Medium.ttf'),
    'Nunito-600': require('../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-700': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-800': require('../assets/fonts/Nunito-ExtraBold.ttf'),
    'Nunito-900': require('../assets/fonts/Nunito-Black.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }


  return (
    <GluestackUIProvider config={config}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false, //hide header
            statusBarStyle: 'dark',
            //title: '',
            //headerStyle: { backgroundColor: '#0A192F' },
            //headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="recipes/[id]"
          options={{
            headerShown: false, //hide header
            statusBarStyle: 'dark',
          }}
        />
    </Stack>
    </GluestackUIProvider>
  );
}
