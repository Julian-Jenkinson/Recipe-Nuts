// FilterPill.tsx
export type FiltersType = {
  sortBy: string;
  category: string[];
  difficulty: string[];
  maxCookTime: number;
};

// SelectablePill.tsx
import { Pressable, Text } from '@gluestack-ui/themed';
import React from 'react';
import { StyleSheet } from 'react-native';

type PillProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

export const FilterPill = ({ label, isSelected, onPress }: PillProps) => (
  <Pressable onPress={onPress} style={[pillStyles.pill, isSelected && pillStyles.pillPressed]}>
    <Text style={[pillStyles.pillText, isSelected && pillStyles.pillTextPressed]}>{label}</Text>
  </Pressable>
);

const pillStyles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#ccc',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 9999,
    marginRight: 2,
    backgroundColor: 'transparent',
  },
  pillPressed: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  pillText: {
    color: '#000',
    fontFamily: 'Nunito-800',
    fontSize: 14,
  },
  pillTextPressed: {
    color: '#fff',
  },
});
