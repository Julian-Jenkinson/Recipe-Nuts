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

SplashScreen.preventAutoHideAsync();

function NoRippleButton(props: PressableProps) {
  return <Pressable {...props} android_ripple={null} />;
}

export default function Layout() {
  const [showQuickTour, setShowQuickTour] = useState(false);

  useEffect(() => {
    const checkFirstOpen = async () => {
      try {
        const hasSeenTour = await AsyncStorage.getItem("hasSeenQuickTour");
        if (!hasSeenTour) {
          setShowQuickTour(true);
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
    const setNavBar = async () => {
      // Make nav bar solid (not overlay), use this order
      //await NavigationBar.setBehaviorAsync('inset-swipe'); 
      //await NavigationBar.setBackgroundColorAsync(theme.colors.bg);
      await NavigationBar.setButtonStyleAsync('dark'); 
    };

    setNavBar();
  }, []);

  if (loaded || error) {
    SplashScreen.hideAsync();
  }

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
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarButton: (props) => <NoRippleButton {...props} />,
          tabBarPressColor: 'transparent',
          tabBarStyle: {
            backgroundColor: theme.colors.bg,
            //backgroundColor: 'white',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 58,
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
          options={{
            title: '',
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.reset({
                index: 0,
                routes: [{ name: 'recipes' }],
              });
            },
          })}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
          }}
        />
        <Tabs.Screen
          name="Menu"
          options={{
            title: '',
          }}
        />
      </Tabs>
      
      <QuickTourModal isOpen={showQuickTour} onClose={() => setShowQuickTour(false)} />
    </GluestackUIProvider>
  );
}