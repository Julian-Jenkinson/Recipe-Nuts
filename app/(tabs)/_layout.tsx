// app/_layout.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider, StatusBar } from '@gluestack-ui/themed';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Tabs } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from "react";
import { QuickTourModal } from "../../components/QuickTourModal";
import theme from '../../theme';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [showQuickTour, setShowQuickTour] = useState(false);

  useEffect(() => {
    const checkFirstOpen = async () => {
      try {
        const hasSeenTour = await AsyncStorage.getItem("hasSeenQuickTour");
        if (!hasSeenTour) {
          // First launch → show modal
          setShowQuickTour(true);
          // Save flag so it won't show again
          await AsyncStorage.setItem("hasSeenQuickTour", "true");
        }
      } catch (e) {
        console.log("Error checking QuickTour flag:", e);
      }
    };
    checkFirstOpen();
  }, []);
  
  const [loaded, error] = useFonts({
    'Nunito-200': require('../../assets/fonts/Nunito-ExtraLight.ttf'),
    'Nunito-300': require('../../assets/fonts/Nunito-Light.ttf'),
    'Nunito-400': require('../../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-500': require('../../assets/fonts/Nunito-Medium.ttf'),
    'Nunito-600': require('../../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-700': require('../../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-800': require('../../assets/fonts/Nunito-ExtraBold.ttf'),
    'Nunito-900': require('../../assets/fonts/Nunito-Black.ttf'),
  });

  useEffect(() => {
    //NavigationBar.setBackgroundColorAsync(theme.colors.bg);
    NavigationBar.setButtonStyleAsync('dark'); // Optional: dark icons on light bg
  }, []);

  if (loaded || error) {
    SplashScreen.hideAsync();
  }
  //I swapped this over with the above but we can look into it again when debugging the package version
  //  useEffect(() => {
  //  if (loaded || error) {
  //    SplashScreen.hideAsync();
  //  }
  //}, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }


  return (
    <GluestackUIProvider config={config}>
      <StatusBar
        backgroundColor={theme.colors.bg}
        barStyle="dark-content"
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0A192F',
          //tabBarActiveTintColor: theme.colors.cta,
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: theme.colors.bg,
            borderTopWidth: 0,
            elevation: 0,      // shadow on Android
            shadowOpacity: 0, // shadow on ios 
          },
        }}
      >
        <Tabs.Screen
          name="recipes"
          options={{
            title: 'Recipes',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="pot-mix-outline" size={size} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault(); // stop default tab behavior
              navigation.reset({
                index: 0,
                routes: [{ name: 'recipes' }], // force it to reload recipes/index.tsx
              });
            },
          })}
        />
        <Tabs.Screen
          name="AddRecipeFromUrl"
          options={{
            title: 'Add',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="plus-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="menu" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      
      {/* QuickTour Modal (only shows once) */}
      <QuickTourModal isOpen={showQuickTour} onClose={() => setShowQuickTour(false)} />

    </GluestackUIProvider>
  );
}
