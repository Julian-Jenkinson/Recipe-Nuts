import { Box, ScrollView } from '@gluestack-ui/themed';
import React from 'react';
import { Keyboard } from 'react-native'; // ✅ Import
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
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
};

const CATEGORIES = ['All', 'Favourites', 'Quick Meals', 'Newest', 'Oldest', 'A-Z', 'Z-A'];

function mapCategoryToMode(category: string): FilterMode {
  switch (category) {
    case 'All': return 'all';
    case 'Favourites': return 'favourites';
    case 'Quick Meals': return 'quick-meals';
    case 'Newest': return 'newest';
    case 'Oldest': return 'oldest';
    case 'A-Z': return 'a-z';
    case 'Z-A': return 'z-a';
    default: return 'all';
  }
}

export default function HorizontalScroll({ filters, setFilters }: HorizontalScrollProps) {
  return (
    <Box pt={14} pb={14}>
      <ScrollView 
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <Box flexDirection="row" gap={12}>
          {CATEGORIES.map((category) => (
            <FilterPill
              key={category}
              label={category}
              isSelected={filters.mode === mapCategoryToMode(category)}
              onPress={() => {
                Keyboard.dismiss(); // Dismiss keyboard first top avoid swallowing taps
                setFilters({ mode: mapCategoryToMode(category) });
              }}
            />
          ))}
        </Box>
      </ScrollView>
    </Box>
  );
}