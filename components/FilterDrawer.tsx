import { Feather } from '@expo/vector-icons';
import { Box, HStack, Text, useTheme } from '@gluestack-ui/themed';
import Slider from '@react-native-community/slider';
import * as SystemUI from 'expo-system-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StatusBar } from 'react-native';
import { FilterPill } from '../components/FilterPill';

export type FiltersType = {
  sortBy: string;
  category: string[];
  difficulty: string[];
  maxCookTime: number;
  favourites: boolean;
};

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
};

const SORT_OPTIONS = ['Recent', 'Alphabetical', 'Prep Time'];
const CATEGORIES = ['Breakfast', 'Appetiser', 'Main', 'Vegetarian', 'Dessert', 'Favourites'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function FilterDrawer({ open, onClose, filters, setFilters }: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<FiltersType>(filters);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open]);

  const toggleItem = (array: string[], item: string): string[] => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  const handleSliderComplete = useCallback((value: number) => {
    setLocalFilters((prev) => ({ ...prev, maxCookTime: value }));
  }, []);

  const theme = useTheme();
  useEffect(() => {
    if (open) {
      SystemUI.setBackgroundColorAsync('#0A192F');  // Set nav bar to match modal
    } else {
      SystemUI.setBackgroundColorAsync('#F2F2F2');    // Or your app's normal nav bar color
    }
  }, [open]);
  return (
    <Modal
      animationType="slide"
      transparent
      visible={open}
      onRequestClose={onClose}
      navigationBarTranslucent
      statusBarTranslucent
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Pressable
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ backgroundColor: 'white', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: 580 }}
        >
          <HStack justifyContent="space-between" mt="auto">
            <Text fontFamily="Nunito-800" size="2xl" color="#000" pb={12}>Sort By</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color="#999" />
            </Pressable>
          </HStack>

          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={8}>
            {SORT_OPTIONS.map((option) => (
              <FilterPill
                key={option}
                label={option}
                isSelected={localFilters.sortBy === option}
                onPress={() => setLocalFilters((prev) => ({ ...prev, sortBy: option }))}
              />
            ))}
          </Box>

          <Text fontFamily="Nunito-800" size="2xl" color="#000" pb={12} pt={8}>Filters</Text>

          <Text fontFamily="Nunito-800" size="lg" color="#000" pb={10}>Category</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={16}>
            {CATEGORIES.map((category) => (
              <FilterPill
                key={category}
                label={category}
                isSelected={
                  category === 'Favourites'
                    ? localFilters.favourites
                    : localFilters.category.includes(category)
                }
                onPress={() => {
                  if (category === 'Favourites') {
                    setLocalFilters((prev) => ({ ...prev, favourites: !prev.favourites }));
                  } else {
                    setLocalFilters((prev) => ({
                      ...prev,
                      category: toggleItem(prev.category, category),
                    }));
                  }
                }}
              />
            ))}
          </Box>

          <Text fontFamily="Nunito-800" size="lg" color="#000" pb={10}>Difficulty</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={16}>
            {DIFFICULTIES.map((level) => (
              <FilterPill
                key={level}
                label={level}
                isSelected={localFilters.difficulty.includes(level)}
                onPress={() => {
                  setLocalFilters((prev) => ({
                    ...prev,
                    difficulty: toggleItem(prev.difficulty, level),
                  }));
                }}
              />
            ))}
          </Box>

          <Text fontFamily="Nunito-800" size="lg" color="#000">Max Cook Time</Text>
          <Text fontFamily="Nunito-700" size="md" color="#666" pb={8}>
            {localFilters.maxCookTime === 240 ? 'Max' : `${localFilters.maxCookTime} mins`}
          </Text>
          <Slider
            style={{ width: '100%', height: 30 }}
            minimumValue={0}
            maximumValue={240}
            step={4}
            minimumTrackTintColor="#0A192F"
            maximumTrackTintColor="#333"
            thumbTintColor="#0A192F"
            value={localFilters.maxCookTime}
            onSlidingComplete={handleSliderComplete}
          />

          <HStack justifyContent="space-between" mt="auto" mx={10} pt={20} mb={50}>
            <Pressable
              onPress={() => {
                setLocalFilters({ sortBy: '', category: [], difficulty: [], maxCookTime: 240, favourites: false });
              }}
              style={{ paddingVertical: 6, paddingHorizontal: 40, borderRadius: 9999, borderColor: '#000', borderWidth: 1.5 }}
            >
              <Text color="#000" size="lg" fontFamily='Nunito-700'>Reset</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setFilters(localFilters);
                onClose();
              }}
              style={{ backgroundColor: '#000', paddingVertical: 6, paddingHorizontal: 40, borderRadius: 9999 }}
            >
              <Text color="#fff" size="lg" fontFamily='Nunito-700'>Apply</Text>
            </Pressable>
          </HStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
