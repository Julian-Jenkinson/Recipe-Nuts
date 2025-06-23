// components/AddRecipeCard.tsx
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
        borderColor='#999'
        borderWidth={1}
        width="100%"
        aspectRatio={1.05}
        overflow="hidden"
        justifyContent="center"
        alignItems="center"
      >
        <Text color='#777' size="2xl">+</Text>
      </Box>
      <Box mt="$2">
        <Text fontSize="$md" pb={5} fontWeight={500} color="$textLight900">
          Add Recipe
        </Text>
      </Box>
    </Pressable>
  );
}
