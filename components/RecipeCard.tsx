import { Feather, FontAwesome } from '@expo/vector-icons';
import { Box, HStack, Image, Pressable, Text } from '@gluestack-ui/themed';
import React from 'react';
import { StyleSheet } from 'react-native';
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
  prepTime,
  cookTime,
  servingSize,
  onPress,
  favourite,
  onToggleFavourite,
}: RecipeCardProps) {
  //console.log(servingSize);

  // Helper function to get the serving size display text or null if it shouldn't render
  function formatServingSize(servingSize?: string): string | null {
    if (!servingSize) return null;
    const val = servingSize.trim();
    // Hide if empty, dash, or zero
    if (!val || val === '-' || +val === 0) return null;
    // Remove "serving" or "servings" (case-insensitive)
    let displayValue = val.replace(/servings?/i, '').trim();
    // Optionally, remove other words like "approx", "about" if you want to clean further
    displayValue = displayValue.replace(/^(approx|about)\s*/i, '').trim();
    // Return the final string
    return `Serves ${displayValue}`;
  }
  const servingSizeText = formatServingSize(servingSize);


  return (
    <Pressable onPress={onPress}>
      <HStack bg="#fff">
        {/* Image Container */}
        <Box width={100} height={100}>
          <Image
            source={
              imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("file"))
                ? { uri: imageUrl }
                : require("../assets/images/error.png")
            }
            alt={title}
            width={100}
            height={100}
            borderRadius={5}
            resizeMode="cover"
          />
        </Box>

        {/* Text Container */}
        <Box flex={1} px={10} py={0} justifyContent='center'>
          <HStack justifyContent="space-between" alignItems="flex-start" mb={4}>
            <Text
              fontSize={17}
              style={styles.titleText}
              color={theme.colors.text1}
              numberOfLines={1}
              flex={1}
              mr={8}
            >
              {title}
            </Text>
            <Pressable
              ml={4}
              hitSlop={10}
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavourite?.();
              }}
            >
              <FontAwesome
                name={favourite ? 'star' : 'star-o'}
                size={20}
                color={favourite ? '#FFC107' : '#999'}
              />
            </Pressable>
          </HStack>

          <Box gap={1}>
            {source && (
              <HStack alignItems="center" gap={8}>
                <Box alignItems="center" justifyContent="center" style={styles.iconContainer}>
                  <Feather name="external-link" size={14} color="#111" strokeWidth={2.5} />
                </Box>
                <Text
                  color={theme.colors.text2}
                  style={styles.metaText}
                  numberOfLines={1}
                >
                  {source.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                </Text>
              </HStack>
            )}

            {(prepTime || cookTime) && (
              <HStack alignItems="center" gap={8}>
                <Box alignItems="center" justifyContent="center" style={styles.iconContainer}>
                  <Feather name="clock" size={14} color="#111" strokeWidth={2.5} />
                </Box>
                <Text
                  color={theme.colors.text2}
                  style={styles.metaText}
                >
                  {(() => {
                    const prep = parseInt(prepTime ?? '') || 0;
                    const cook = parseInt(cookTime ?? '') || 0;
                    const total = prep + cook;
                    return total > 0 ? `${total} mins` : (prepTime || cookTime);
                  })()}
                </Text>
              </HStack>
            )}

            {servingSizeText && (
              <HStack alignItems="center" gap={8}>
                <Box alignItems="center" justifyContent="center" style={styles.iconContainer}>
                  <Feather name="users" size={14} color="#111" strokeWidth={2.5} />
                </Box>
                <Text
                  color={theme.colors.text2}
                  style={styles.metaText}
                  numberOfLines={1}
                >
                  {servingSizeText}
                </Text>
              </HStack>
            )}
          </Box>
        </Box>
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titleText: {
    fontFamily: 'body-800',
  },
  metaText: {
    fontFamily: 'body-400',
    lineHeight: 20,
    fontSize: 15,
  },
  iconContainer: {
    height: 20,
  },
  iconStyle: {
    color: '#111',
  },
});