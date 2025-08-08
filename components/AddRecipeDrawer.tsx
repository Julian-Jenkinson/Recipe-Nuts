import { Feather } from '@expo/vector-icons';
import { HStack, Text, useTheme } from '@gluestack-ui/themed';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { Modal, Pressable, StatusBar } from 'react-native';


type Props = {
  isOpen: boolean;
  onClose: () => void;
  
};


export default function AddRecipeDrawer({ isOpen, onClose}: Props) {


  const theme = useTheme();
  useEffect(() => {
    if (isOpen) {
      SystemUI.setBackgroundColorAsync('#0A192F');  // Set nav bar to match modal
    } else {
      SystemUI.setBackgroundColorAsync('#F2F2F2');    // Or your app's normal nav bar color
    }
  }, [isOpen]);
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
          <HStack justifyContent="space-between" mt="auto">
            <Text fontFamily="Nunito-800" size="2xl" color="#000" pb={12}>Add Recipe</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color="#999" />
            </Pressable>
          </HStack>

          <Pressable>
            <Text>Add recipe from url</Text> 
          </Pressable>

          <Pressable>
            <Text>Create new recipe</Text>
          </Pressable>

          

        </Pressable>
      </Pressable>
    </Modal>
  );
}
