import { Box, ScrollView } from '@gluestack-ui/themed';
import React from 'react';
import { FilterPill } from '../components/FilterPill';

export type FiltersType = {
  category: string[];
  favourites: boolean;
};

type HorizontalScrollProps = {
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
};

const CATEGORIES = ['All', 'Favourites', 'Appetisers', 'Mains', 'Desserts', 'Breakfasts'];

export default function HorizontalScroll({ filters, setFilters }: HorizontalScrollProps) {
  return (
    <Box pt={20} pb={5}>
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
              isSelected={
                category === 'All' 
                  ? filters.category.length === 0 && !filters.favourites
                  : category === 'Favourites'
                  ? filters.favourites
                  : filters.category.includes(category) && !filters.favourites
              }
              onPress={() => {
                if (category === 'All') {
                  setFilters((prev) => ({ ...prev, category: [], favourites: false }));
                } else if (category === 'Favourites') {
                  setFilters((prev) => ({ ...prev, category: [], favourites: true }));
                } else {
                  setFilters((prev) => ({ ...prev, category: [category], favourites: false }));
                }
              }}
              
            />
          ))}
        </Box>
      </ScrollView>
    </Box>
  );
}