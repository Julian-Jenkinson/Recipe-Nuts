// RecipeDetailsScreen.tsx
import { Box, Button, Text } from '@gluestack-ui/themed';
import React from 'react';

export default function RecipeDetailsScreen() {
  return (
    
    <Box flex={1} justifyContent="center" alignItems="center" bg="$backgroundLight0">
      <Text color="$textLight900" fontSize="$xl">Name</Text>
      <Button mt="$4" size="md" variant="solid" action="primary">
        Click Me
      </Button>
      <Text color="$textLight900" fontSize="$xl">Ingregients</Text>
      <Button mt="$4" size="md" variant="solid" action="primary">
        Click Me
      </Button>
    </Box>

  );
}