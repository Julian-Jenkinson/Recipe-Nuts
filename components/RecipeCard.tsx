import { Box, Image, Pressable, Text } from '@gluestack-ui/themed';
import React, { useState } from 'react';

type RecipeCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  source?: string; // optional just in case
   prepTime?: string;
  cookTime?: string;
  difficulty?: string;
  servingSize?: string;
  notes?: string[];
  category?: string;
  favourite?: boolean;
  onPress: () => void;
};

export default function RecipeCard({ title, imageUrl, source, onPress }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Pressable onPress={onPress}>
      <Box
        mb="$2"
        bg="$backgroundLight300"
        borderRadius={8}
        width="100%"
        aspectRatio={1.05}
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
            bg="$backgroundLight200"
            borderRadius={20}
          />
        )}
      </Box>

      <Box mt="$2">
        <Text fontSize="$md" pb="$1" fontWeight={500} color="$textLight900" numberOfLines={1}>
          {title}
        </Text>
        {!!source && (
          <Text fontSize="$sm" color="$textLight600" numberOfLines={1}>
            {source.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}
