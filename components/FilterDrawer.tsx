import { Box, HStack, Pressable, Text } from '@gluestack-ui/themed';
import React, { useState } from 'react';
import { Modal, StyleSheet } from 'react-native';

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function FilterDrawer({ open, onClose }: FilterDrawerProps) {
  
  const [pressed, setPressed] = useState(false);
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={open}
      onRequestClose={onClose}
      navigationBarTranslucent={true}
      statusBarTranslucent={true}
    >
      {/* This Pressable covers the whole screen and closes the drawer on press */}
      <Pressable
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onClose}
      >
        {/* This inner View prevents the press event from propagating to the overlay */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ backgroundColor: 'white', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: 600 }}
        >
          <Text fontFamily="Nunito-800" size="2xl" color='#000' py={8} pt={14}>Sort By</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={12}>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Newest</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Oldest</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>A - Z</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Prep Time</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>A - Z</Text>
            </Pressable>
          </Box>

          <Text fontFamily="Nunito-800" size="2xl" color='#000' py={8} pt={14}>Filters</Text>
          
          <Text fontFamily="Nunito-800" size="lg" color='#000'pb={8}>Category</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={12}>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Breakfast</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Appetiser</Text>
            </Pressable>
            <Pressable style={[styles.pill, pressed && styles.pillPressed]}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      >
              <Text style={styles.pillText}>Mains</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Vegetarian</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Dessert</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Other</Text>
            </Pressable>
          </Box>

          <Text fontFamily="Nunito-800" size="lg" color='#000'pb={8}>Difficulty</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={12}>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}> Difficulty Selector</Text>
            </Pressable>
          </Box>

          <Text fontFamily="Nunito-800" size="lg" color='#000'pb={8}>Cook Time</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={12}>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Cook Time Selector</Text>
            </Pressable>
          </Box>

          <HStack justifyContent="space-between" mt="auto" mx={25} pt={12}>
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: '#000',
                paddingVertical: 10,
                paddingHorizontal: 50,
                borderRadius: 9999,
              }}
            >
              <Text color="#fff" size="lg" fontFamily='Nunito-700'>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: '#000',
                paddingVertical: 10,
                paddingHorizontal: 50,
                borderRadius: 9999,
              }}
            >
              <Text color="#fff" size="lg" fontFamily='Nunito-700'>
                Apply
              </Text>
            </Pressable>
          </HStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#000',  // black background on press
    borderColor: '#000',
  },
  pillText: {
    color: '#000',
    fontFamily: 'Nunito-800',
  },
  pillTextPressed: {
    color: '#fff',  // white text on press
  }
})