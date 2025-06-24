import { Ionicons } from '@expo/vector-icons';
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
  onToggleFavourite?: () => void; 
};

export default function RecipeCard({ title, imageUrl, source, onPress, favourite, onToggleFavourite }: RecipeCardProps) {
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
        {/* Heart icon overlay */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation(); // prevent card press
            onToggleFavourite?.();
          }}
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 10,
          }}
        >
          <Box
            //bg="$backgroundLight100"   
            bg="white"
            p={2}                     
            borderRadius={7}       
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons
              name={favourite ? 'heart' : 'heart-outline'}
              size={20}
              //color={favourite ? '#EF4444' : '#EF4444'}
              color={favourite ? '#EF4444' : '#333'}
            />
          </Box>
        </Pressable>



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
  );
}
