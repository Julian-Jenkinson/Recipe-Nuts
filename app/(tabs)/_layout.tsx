import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddRecipeDrawer from '../../components/AddRecipeDrawer';
import theme from '../../theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.cta,
          tabBarInactiveTintColor: theme.colors.text2,
          tabBarShowIcon: true,
          tabBarShowLabel: true,
          tabBarStyle: {
            height: 72 + insets.bottom,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 18,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: -4 },
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
          tabBarLabelStyle: {
            fontFamily: 'body-700',
            fontSize: 12,
          },
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="recipes/index"
          options={{
            title: 'Recipes',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" color={color} size={size ?? 22} />
            ),
          }}
        />
        <Tabs.Screen
          name="collections/index"
          options={{
            title: 'Collections',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="albums-outline" color={color} size={size ?? 22} />
            ),
          }}
        />
        <Tabs.Screen
          name="add/index"
          options={{
            title: '',
            tabBarIcon: () => null,
            tabBarLabel: '',
            tabBarButton: () => (
              <View pointerEvents="box-none" style={styles.addButtonWrap}>
                <Pressable
                  onPress={() => setIsAddOpen(true)}
                  style={[
                    styles.addButton,
                    {
                      marginBottom: Math.max(insets.bottom - 4, 0),
                    },
                  ]}
                >
                  <Ionicons name="add" size={34} color="#fff" />
                </Pressable>
              </View>
            ),
          }}
          listeners={{
            tabPress: (event) => {
              event.preventDefault();
              setIsAddOpen(true);
            },
          }}
        />
        <Tabs.Screen
          name="planner/index"
          options={{
            title: 'Planner',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" color={color} size={size ?? 22} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="menu-outline" color={color} size={size ?? 22} />
            ),
          }}
        />
      </Tabs>
      <AddRecipeDrawer isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  addButtonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  addButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    borderWidth: 5,
    borderColor: '#fff',
  },
});
