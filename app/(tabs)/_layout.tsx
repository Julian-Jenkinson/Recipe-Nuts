import { MaterialCommunityIcons } from '@expo/vector-icons';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider, StatusBar } from '@gluestack-ui/themed';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Tabs } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from "react";
import { Pressable, PressableProps, Text, View } from "react-native";
import { QuickTourModal } from "../../components/QuickTourModal";
import theme from '../../theme';

function NoRippleButton(props: PressableProps) {
  console.log("🟡 no ripple about to be called");
  return <Pressable {...props} android_ripple={null} />;
}

export default function Layout() {
  console.log("🟡 Layout started");

  const [showQuickTour, setShowQuickTour] = useState(false);

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
    // Prevent splash screen from auto-hiding
    SplashScreen.preventAutoHideAsync()
      .then(() => console.log("🟡 SplashScreen prevented"))
      .catch((e) => console.warn("⚠️ SplashScreen.preventAutoHideAsync failed:", e));

    const setNavBar = async () => {
      try {
        await NavigationBar.setButtonStyleAsync('dark');
        console.log("✅ NavigationBar button style set to dark");
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

      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarButton: (props) => <NoRippleButton {...props} />,
          tabBarPressColor: 'transparent',
          tabBarStyle: {
            backgroundColor: theme.colors.bg,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 100,
          },
          tabBarIcon: ({ focused }) => {
            const iconName =
              route.name === 'recipes'
                ? 'pot-mix-outline'
                : route.name === 'add'
                ? 'plus-circle-outline'
                : 'menu';

            const label =
              route.name === 'recipes'
                ? 'Recipes'
                : route.name === 'add'
                ? 'Add'
                : 'Menu';

            const circleSize = 52;

            return (
              <View
                style={{
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: focused ? theme.colors.cta : 'transparent',
                  paddingBottom: 2,
                  marginBottom: -26,
                }}
              >
                <MaterialCommunityIcons
                  name={iconName}
                  size={24}
                  color={focused ? '#fff' : '#999'}
                />
                <Text
                  style={{
                    fontSize: 10,
                    color: focused ? '#fff' : '#999',
                    fontWeight: focused ? '600' : '400',
                  }}
                >
                  {label}
                </Text>
              </View>
            );
          },
        })}
      >
        <Tabs.Screen
          name="recipes"
          options={{ title: '' }}
        />
        <Tabs.Screen name="add" options={{ title: '' }} />
        <Tabs.Screen name="Menu" options={{ title: '' }} />
      </Tabs>

      <QuickTourModal isOpen={showQuickTour} onClose={() => setShowQuickTour(false)} />
    </GluestackUIProvider>
  );
}