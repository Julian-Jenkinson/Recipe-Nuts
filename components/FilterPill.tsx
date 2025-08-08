// FilterPill.tsx
import theme from '../theme';

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
    //alignSelf: 'center',
    //borderWidth: 1.5,
    //borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 0,
    marginRight: 2,
    ///backgroundColor: '#e3e3e3',
    backgroundColor: theme.colors.bgFocus,
  },
  pillPressed: {
    //backgroundColor: '#000',
    backgroundColor: theme.colors.cta,
    ///borderColor: '#000',
  },
  pillText: {
    color: theme.colors.text1,
    fontFamily: 'body-800',
    fontSize: 14,
    flex:1,
  },
  pillTextPressed: {
    color: theme.colors.ctaText,
  },
});
