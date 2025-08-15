import { Box, HStack } from '@gluestack-ui/themed';
import { useRecipeStore } from '../stores/useRecipeStore';

export const RecipeBar = () => {
  const recipes = useRecipeStore((state) => state.recipes);
  const count = Math.min(recipes.length, 10);

  return (
    <HStack space="xs" alignItems="center" flex={1} w="100%">
      {Array.from({ length: 10 }, (_, i) => (
        <Box
          key={i}
          flex={1} // each box takes equal share of width
          h="$2"
          bg={i < count ? '$primary500' : '$coolGray300'}
          rounded="$full"
        />
      ))}
    </HStack>
  );
};
