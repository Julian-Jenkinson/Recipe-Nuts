import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { useFonts } from 'expo-font';
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from "react";
import { Pressable, PressableProps, StatusBar } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QuickTourModal } from "../components/QuickTourModal";
import { useRecipeStore } from '../stores/useRecipeStore';

import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';

function NoRippleButton(props: PressableProps) {
  console.log("🟡 no ripple about to be called");
  return <Pressable {...props} android_ripple={null} />;
}

export default function Layout() {
  console.log("🟡 Layout started");

  const setPro = useRecipeStore((state) => state.setPro);
  const [showQuickTour, setShowQuickTour] = useState(false);

  const [loaded, error] = useFonts({
    'heading-800': require('../assets/fonts/Mulish-ExtraBold.ttf'),
    'heading-900': require('../assets/fonts/Mulish-Black.ttf'),
    
    'body-400': require('../assets/fonts/Mulish-Light.ttf'),
    'body-500': require('../assets/fonts/Mulish-Regular.ttf'),
    'body-600': require('../assets/fonts/Mulish-Medium.ttf'),
    'body-700': require('../assets/fonts/Mulish-Bold.ttf'),
    'body-800': require('../assets/fonts/Mulish-ExtraBold.ttf'),
    'body-900': require('../assets/fonts/Mulish-Black.ttf'),
  });

  // Revenue Cat Initilization
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        // 1️⃣ Configure RevenueCat
        if (Platform.OS === "ios") {
          // Purchases.configure({ apiKey: IOS_KEY });
        } 
        else {
          Purchases.configure({
            apiKey: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY!,
          });
        }

        const store = useRecipeStore.getState();

        // 2️⃣ Use persisted Pro state first (offline-friendly)
        let isPro = store.isPro;
        let customerInfo = store.customerInfo;

        // 3️⃣ Try fetching latest info from RevenueCat
        try {
          const info = await Purchases.getCustomerInfo();
          customerInfo = info;
          isPro = !!info.entitlements.active["pro"];

          // 4️⃣ Only update store if info is available
          useRecipeStore.setState({ customerInfo, isPro });
        } catch (err) {
          console.warn("⚠️ RevenueCat fetch failed, using persisted state", err);
          // Keep offline state intact; do not overwrite isPro
        }

      } catch (err) {
        console.warn("⚠️ RevenueCat init failed:", err);
      }
    };

    initRevenueCat();
  }, []);
  
  useEffect(() => {
    // Prevent splash screen from auto-hiding
    SplashScreen.preventAutoHideAsync()
      .then(() => console.log("🟡 SplashScreen prevented"))
      .catch((e) => console.warn("⚠️ SplashScreen.preventAutoHideAsync failed:", e));

    const setNavBar = async () => {
      try {
        // Adjust button (icon) style for contrast
        await NavigationBar.setButtonStyleAsync("dark"); // "light" or "dark"
        // Show or hide nav bar
        await NavigationBar.setVisibilityAsync("visible"); // or "hidden"
        //SystemUI.setBackgroundColorAsync(theme.colors.bg)
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

  return (
    <GluestackUIProvider config={config}>
      <KeyboardProvider>
        <StatusBar
          //backgroundColor={theme.colors.cta}
          //barStyle="light-content"
          translucent={true} // added this to try and resolve extra padding bug... not sure if i need it
        />
        <Stack
          screenOptions={{
            headerShown: false,
          }} 
        />     
        <QuickTourModal isOpen={showQuickTour} onClose={() => setShowQuickTour(false)} />
      </KeyboardProvider>
    </GluestackUIProvider>
  );
}