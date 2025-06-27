// components/AddRecipeButton.tsx
import { Ionicons } from '@expo/vector-icons';
import { Box, Text } from '@gluestack-ui/themed';
import React from 'react';
import { Pressable } from 'react-native';

type Props = {
  onPress: () => void;
};

export default function AddRecipeButton({ onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Box
        mb="$2"
        bg="$backgroundLight100"
        borderRadius={8}
        borderColor='#777'
        borderWidth={1}
        width="100%"
        aspectRatio={1.2}
        overflow="hidden"
        justifyContent="center"
        alignItems="center"
        // Shadow for iOS
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.2}
        shadowRadius={4}
        // Shadow for Android
        elevation={4}

      >
        <Ionicons name="add-outline" size={28} color="#777" />
      </Box>
      <Box mt="$2">
        <Text fontSize="$md" pb={5} style={{ fontFamily: 'Nunito-800' }} color="$textLight900">
          Add Recipe
        </Text>
      </Box>
    </Pressable>
  );
}
