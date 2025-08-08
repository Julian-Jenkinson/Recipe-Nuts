import { Feather } from '@expo/vector-icons';
import { HStack, Text, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StatusBar } from 'react-native';
import { useRecipeStore } from '../stores/useRecipeStore';
import theme from '../theme';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddRecipeDrawer({ isOpen, onClose }: Props) {
  const router = useRouter();

  // Access recipe data and pro status
  const recipes = useRecipeStore((state) => state.recipes);
  const isPro = useRecipeStore((state) => state.isPro);

  // Check if free tier limit is reached
  const hasReachedLimit = !isPro && recipes.length >= 10;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isOpen}
      onRequestClose={onClose}
      navigationBarTranslucent
      statusBarTranslucent
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Pressable
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ backgroundColor: 'white', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        >
          <HStack justifyContent="space-between" mt="auto" pt={10} pb={16}>
            <Text fontFamily="body-800" fontSize={26} color="#000">Add Recipe</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color="#999" />
            </Pressable>
          </HStack>

          <VStack pb={60} gap={14}>
            {hasReachedLimit && (
              <Text
                fontFamily="body-600"
                fontSize={16}
                color="#333"
                pb={10}
                textAlign="center"
              >
                Free tier limit reached. Upgrade to add more recipes.
              </Text>
            )}

            {!hasReachedLimit && (
              <>
                <Pressable
                  onPress={() => {
                    onClose();
                    router.push('/add/AddFromURL');
                  }}
                >
                  <HStack alignItems="center">
                    <Feather name="link" size={20} color="#000" />
                    <Text fontFamily="body-600" fontSize={20} pl={8}>Add recipe from link</Text>
                  </HStack>
                </Pressable>

                <Pressable
                  onPress={() => {
                    onClose();
                    router.push('/add/AddBlankRecipe');
                  }}
                >
                  <HStack alignItems="center">
                    <Feather name="plus" size={20} color="#000" />
                    <Text fontFamily="body-600" fontSize={20} pl={8}>Create new recipe</Text>
                  </HStack>
                </Pressable>
              </>
            )}

            {hasReachedLimit && (
              <Pressable
                onPress={() => {
                  onClose();
                  router.push('/menu');
                }}
                style={{ marginTop: 10, alignSelf: 'center' }}
              >
                <Text fontFamily="body-600" fontSize={18} color={theme.colors.cta}>
                  Upgrade Now
                </Text>
              </Pressable>
            )}
          </VStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
