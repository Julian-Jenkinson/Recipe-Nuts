import { Box, ScrollView } from '@gluestack-ui/themed';
import React from 'react';
import { Keyboard } from 'react-native';
import { FilterPill } from '../components/FilterPill';

export type FilterMode =
  | 'all'
  | 'favourites'
  | 'quick-meals'
  | 'newest'
  | 'oldest'
  | 'a-z'
  | 'z-a';

export type FiltersType = {
  mode: FilterMode;
};

type HorizontalScrollProps = {
  filters?: FiltersType; // ✅ optional to avoid crash
  setFilters?: React.Dispatch<React.SetStateAction<FiltersType>>;
};

const CATEGORIES = ['All', 'Favourites', 'Quick Meals', 'Newest', 'Oldest', 'A-Z', 'Z-A'];

function mapCategoryToMode(category: string): FilterMode {
  switch (category) {
    case 'All':
      return 'all';
    case 'Favourites':
      return 'favourites';
    case 'Quick Meals':
      return 'quick-meals';
    case 'Newest':
      return 'newest';
    case 'Oldest':
      return 'oldest';
    case 'A-Z':
      return 'a-z';
    case 'Z-A':
      return 'z-a';
    default:
      return 'all';
  }
}

export default function HorizontalScroll({ filters, setFilters }: HorizontalScrollProps) {
  // ✅ Defensive fallback if filters is missing
  const safeFilters: FiltersType = filters ?? { mode: 'all' };

  return (
    <Box pt={14} pb={14}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        onTouchStart={() => Keyboard.dismiss()} // ✅ closes keyboard before taps
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <Box flexDirection="row" gap={12}>
          {CATEGORIES.map((category) => {
            const mode = mapCategoryToMode(category);
            return (
              <FilterPill
                key={category}
                label={category}
                isSelected={safeFilters.mode === mode}
                onPress={() => {
                  Keyboard.dismiss(); // ✅ ensure keyboard hides first
                  setFilters?.({ mode }); // ✅ safe optional call
                }}
              />
            );
          })}
        </Box>
      </ScrollView>
    </Box>
  );
}
