import { FontAwesome } from '@expo/vector-icons';
import { Box, Image, Pressable, Text } from '@gluestack-ui/themed';
import React from 'react';
import theme from '../theme';

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
      bg="#fff"
    >
      <Pressable
        onPress={onPress}
      >
        {/* Image Container */}
        <Box 
          width="100%" 
          aspectRatio={1.2} 
          justifyContent="center" 
          alignItems="center"
          
          
        >
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
            <Box bg="white" p={3} borderRadius={4} alignItems="center" justifyContent="center">
              <FontAwesome
                name={favourite ? 'star' : 'star-o'}
                size={19}
                color={favourite ? '#FFC107' : '#999'}
              />
            </Box>
          </Pressable>

          <Image
            source={
              imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("file"))
                ? { uri: imageUrl }
                : require("../assets/images/error.png")
            }
            accessibilityLabel={title ? `Image of ${title}` : "Recipe image"}
            alt={title}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            borderRadius={6}
          />
        </Box>

        {/* Text Container */}
        <Box py={4}>
          <Text 
            fontSize={16} 
            style={{ fontFamily: 'body-800' }} 
            color={theme.colors.text1} 
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            fontSize="$sm"
            color={theme.colors.text2}
            style={{ fontFamily: "body-400" }}
            numberOfLines={1}
          >
            {source
              ? source.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
              : " "} {/* <-- non-breaking space keeps height */}
          </Text>
        </Box>
      </Pressable>
    </Box>
  );
}
