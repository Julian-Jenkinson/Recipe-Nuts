import { Feather } from '@expo/vector-icons';
import { Box, HStack, Text } from '@gluestack-ui/themed';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { FilterPill } from '../components/FilterPill';

export type FiltersType = {
  sortBy: string;
  category: string;
  difficulty: string;
  maxCookTime: number;
};

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
};

const SORT_OPTIONS = ['Newest', 'Oldest', 'Alphabetical', 'Prep Time'];
const CATEGORIES = ['Breakfast', 'Appetiser', 'Main', 'Vegetarian', 'Dessert', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function FilterDrawer({ open, onClose, filters, setFilters }: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<FiltersType>(filters);

  // Keep localFilters in sync when drawer opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={open}
      onRequestClose={onClose}
      navigationBarTranslucent
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ backgroundColor: 'white', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: 650 }}
        >
          <HStack justifyContent="space-between" mt="auto">
            <Text fontFamily="Nunito-800" size="2xl" color="#000" pb={14}>Sort By</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color="#000" />
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

          <Text fontFamily="Nunito-800" size="2xl" color="#000" pb={14} pt={16}>Filters</Text>

          <Text fontFamily="Nunito-800" size="lg" color="#000" pb={10}>Category</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={16}>
            {CATEGORIES.map((category) => (
              <FilterPill
                key={category}
                label={category}
                isSelected={localFilters.category === category}
                onPress={() => setLocalFilters((prev) => ({ ...prev, category }))}
              />
            ))}
          </Box>

          <Text fontFamily="Nunito-800" size="lg" color="#000" pb={10}>Difficulty</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={16}>
            {DIFFICULTIES.map((level) => (
              <FilterPill
                key={level}
                label={level}
                isSelected={localFilters.difficulty === level}
                onPress={() => setLocalFilters((prev) => ({ ...prev, difficulty: level }))}
              />
            ))}
          </Box>

          <Text fontFamily="Nunito-800" size="lg" color="#000">Max Cook Time</Text>
          <Text fontFamily="Nunito-700" size="md" color="#666" pb={8}>
            {localFilters.maxCookTime} mins
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
            onValueChange={(value) => setLocalFilters((prev) => ({ ...prev, maxCookTime: value }))}
          />

          <HStack justifyContent="space-between" mt="auto" mx={32} pt={30}>
            <Pressable
              onPress={() => {
                setLocalFilters({ sortBy: '', category: '', difficulty: '', maxCookTime: 240 });
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
