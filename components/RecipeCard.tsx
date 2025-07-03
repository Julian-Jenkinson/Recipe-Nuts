import { FontAwesome } from '@expo/vector-icons';
import { Box, Image, Pressable, Text } from '@gluestack-ui/themed';
import React from 'react';

type RecipeCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  source?: string;
  prepTime?: string;
  cookTime?: string;
  difficulty?: string;
  servingSize?: string;
  notes?: string[];
  category?: string;
  favourite?: boolean;
  onPress: () => void;
  onToggleFavourite?: () => void;
};

export default function RecipeCard({
  title,
  imageUrl,
  source,
  onPress,
  favourite,
  onToggleFavourite,
}: RecipeCardProps) {
  return (
    <Box
      borderRadius={8}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.2}
      shadowRadius={4}
      elevation={5}
      bg="#f5f5f5" // check this colour is correct
    >
      <Pressable
        onPress={onPress}
        borderRadius={8}
        overflow="hidden"
      >
        {/* Image Container */}
        <Box width="100%" aspectRatio={1.2} justifyContent="center" alignItems="center">
          {/* Heart icon overlay */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavourite?.();
            }}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              zIndex: 10,
            }}
          >
            <Box bg="white" p={3} borderRadius={6} alignItems="center" justifyContent="center">
              <FontAwesome
                name={favourite ? 'star' : 'star-o'}
                size={19}
                color={favourite ? '#FFC107' : '#999'}
              />
            </Box>
          </Pressable>

          <Image
            source={{ uri: imageUrl }}
            alt={title}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </Box>

        {/* Text Container */}
        <Box px={8} py={8}>
          <Text fontSize="$md" style={{ fontFamily: 'Nunito-800' }} color="$textLight900" numberOfLines={1}>
            {title}
          </Text>
          {!!source && (
            <Text fontSize="$sm" color="$textLight600" style={{ fontFamily: 'Nunito-400' }} numberOfLines={1}>
              {source.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
            </Text>
          )}
        </Box>
      </Pressable>
    </Box>
  );
}
