import { config } from '@gluestack-ui/config';
import { GluestackUIProvider, StatusBar } from '@gluestack-ui/themed';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useState } from "react";
import { Pressable, PressableProps } from "react-native";
import { QuickTourModal } from "../components/QuickTourModal";
import theme from '../theme';

function NoRippleButton(props: PressableProps) {
  console.log("🟡 no ripple about to be called");
  return <Pressable {...props} android_ripple={null} />;
}

export default function Layout() {
  console.log("🟡 Layout started");

  const [showQuickTour, setShowQuickTour] = useState(false);

  const [loaded, error] = useFonts({
    'Nunito-200': require('../assets/fonts/Nunito-ExtraLight.ttf'),
    'Nunito-300': require('../assets/fonts/Nunito-Light.ttf'),
    'Nunito-400': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-500': require('../assets/fonts/Nunito-Medium.ttf'),
    'Nunito-600': require('../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-700': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-800': require('../assets/fonts/Nunito-ExtraBold.ttf'),
    'Nunito-900': require('../assets/fonts/Nunito-Black.ttf'),
    
    //'OpenSans-400': require('../assets/fonts/OpenSans-Regular.ttf'),
    //'OpenSans-800': require('../assets/fonts/OpenSans-Bold.ttf'),

    //Heading
    //'heading-800': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
    'heading-800': require('../assets/fonts/Mulish-ExtraBold.ttf'),
    
    //Body
    //'body-400': require('../assets/fonts/Montserrat-Regular.ttf'),
    //'body-800': require('../assets/fonts/Montserrat-Bold.ttf'),

    //'body-400': require('../assets/fonts/OpenSans-Regular.ttf'),
    //'body-800': require('../assets/fonts/OpenSans-Bold.ttf'),

    'body-400': require('../assets/fonts/Mulish-Light.ttf'),
    //'body-400': require('../assets/fonts/Mulish-Light.ttf'),
    'body-500': require('../assets/fonts/Mulish-Regular.ttf'),
    'body-600': require('../assets/fonts/Mulish-Medium.ttf'),
    'body-700': require('../assets/fonts/Mulish-Bold.ttf'),
    'body-800': require('../assets/fonts/Mulish-ExtraBold.ttf'),
    


  });

  useEffect(() => {
    // Prevent splash screen from auto-hiding
    SplashScreen.preventAutoHideAsync()
      .then(() => console.log("🟡 SplashScreen prevented"))
      .catch((e) => console.warn("⚠️ SplashScreen.preventAutoHideAsync failed:", e));

    const setNavBar = async () => {
      try {
        
        // @ts-ignore
        //await NavigationBar.setEdgeToEdgeEnabledAsync(false); // disable edge-to-edge
        //await NavigationBar.setBackgroundColorAsync("fff");
        //await NavigationBar.setButtonStyleAsync('dark');
        SystemUI.setBackgroundColorAsync(theme.colors.bg)
        console.log("✅ NavigationBar customized");
      } catch (e) {
        console.warn("⚠️ Failed to set NavigationBar style:", e);
      }
    };

    const checkFirstOpen = async () => {
      try {
        const hasSeenTour = await AsyncStorage.getItem("hasSeenQuickTour");
        console.log("📦 AsyncStorage.hasSeenQuickTour =", hasSeenTour);
        if (!hasSeenTour) {
          setShowQuickTour(true);
          await AsyncStorage.setItem("hasSeenQuickTour", "true");
        }
      } catch (e) {
        console.warn("⚠️ Error checking QuickTour flag:", e);
      }
    };

    setNavBar();
    checkFirstOpen();
  }, []);

  useEffect(() => {
    console.log("🔄 useEffect: Font load state -> loaded:", loaded, "| error:", error);
    
    // Set a timeout to force hide splash screen after reasonable time
    const timeout = setTimeout(() => {
      console.log("⏰ Font loading timeout - hiding splash screen anyway");
      SplashScreen.hideAsync()
        .then(() => console.log("✅ SplashScreen hidden (timeout)"))
        .catch((e) => console.warn("⚠️ Error hiding SplashScreen (timeout):", e));
    }, 5000); // 5 second timeout

    if (loaded || error) {
      clearTimeout(timeout);
      SplashScreen.hideAsync()
        .then(() => {
          console.log("✅ SplashScreen hidden");
        })
        .catch((e) => {
          console.warn("⚠️ Error hiding SplashScreen:", e);
        });
    }

    return () => clearTimeout(timeout);
  }, [loaded, error]);

  if (error) {
    console.error("❌ Font loading error:", error);
  }

  // Removed the hanging loading screen - just render main UI
  // Fonts will load progressively and app won't hang

  return (
    <GluestackUIProvider config={config}>
      <StatusBar
        backgroundColor={theme.colors.bg}
        barStyle="dark-content"
      />
      
      <Stack
        screenOptions={{
          headerShown: false,
        }} 
      />     

      <QuickTourModal isOpen={showQuickTour} onClose={() => setShowQuickTour(false)} />
    </GluestackUIProvider>
  );
}