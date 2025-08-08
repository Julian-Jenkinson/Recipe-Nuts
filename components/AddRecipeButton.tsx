import { Ionicons } from '@expo/vector-icons';
import { Box } from '@gluestack-ui/themed';
import React from 'react';
import { Pressable } from 'react-native';

type Props = {
  onPress: () => void;
};

export default function AddRecipeButton({ onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Box
        bg="#222"
        borderRadius={999}
        borderColor="#777"
        borderWidth={0}
        height={50}
        width={50}
        justifyContent="center"
        alignItems="center"
        //shadowColor="#000"
        //shadowOffset={{ width: 0, height: 2 }}
        //shadowOpacity={0.2}
        //shadowRadius={4}
        //elevation={4}
      >
        <Ionicons name="add-outline" size={45} color="#fff" />
      </Box>
    </Pressable>
  );
}
