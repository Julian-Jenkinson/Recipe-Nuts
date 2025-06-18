import { Box, Image, Pressable, Text } from '@gluestack-ui/themed';
import React, { useState } from 'react';

type RecipeCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  onPress: () => void;
};

export default function RecipeCard({ title, imageUrl, onPress }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Pressable onPress={onPress}>
      <Box
        mb="$2"
        bg="$backgroundLight300"
        borderRadius={20}
        width="100%"
        aspectRatio={1}
        overflow="hidden"
        justifyContent="center"
        alignItems="center"
      >
        {!imageError ? (
          <Image
            source={{ uri: imageUrl }}
            alt={title}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Box
            width="100%"
            height="100%"
            bg="$backgroundLight200" // slightly different shade for blank box
            borderRadius={20}
          />
        )}
      </Box>
      <Box>
        <Text fontSize="$md" pb={20} color="$textLight900">
          {title}
        </Text>
      </Box>
    </Pressable>
  );
}
