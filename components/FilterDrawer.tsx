import { Feather } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text } from '@gluestack-ui/themed';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { Modal, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

<Ionicons name="close" size={24} color="#333" />



type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const marks = ["0hr", '1hr', '2hr', '3hr+'];

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
          style={{ backgroundColor: 'white', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: 650 }}
        >
          
        <HStack justifyContent="space-between" mt="auto" >
          <Text fontFamily="Nunito-800" size="2xl" color='#000' pb={14}>Sort By</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color="#000" />
            </Pressable>
          </HStack>          
          
          
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={8}>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Newest</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Oldest</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Alphabetical</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Prep Time</Text>
            </Pressable>
          </Box>

          <Text fontFamily="Nunito-800" size="2xl" color='#000' pb={14} pt={16}>Filters</Text>
          
          <Text fontFamily="Nunito-800" size="lg" color='#000'pb={10}>Category</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={16}>
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
              <Text style={styles.pillText}>Main</Text>
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

          <Text fontFamily="Nunito-800" size="lg" color='#000'pb={10}>Difficulty</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={12} pb={16}>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Easy</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Medium</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>Hard</Text>
            </Pressable>
          </Box>

          <Text fontFamily="Nunito-800" size="lg" color='#000'>Max Cook Time</Text>
          <Text fontFamily="Nunito-700" size="md" color='#666'pb={8}>
            {/*{maxCookTime}*/}25 mins
          </Text>
          <Slider
            style={{ width: '100%', height: 30 }}
            minimumValue={0}
            maximumValue={240}
            step={4}
            minimumTrackTintColor="#0A192F"
            maximumTrackTintColor="#333"
            thumbTintColor="#0A192F"
            //value={maxCookTime}
            //onValueChange={setMaxCookTime}
          />
          

          <HStack justifyContent="space-between" mt="auto" mx={32} pt={30}>
            <Pressable
              onPress={onClose}
              style={{
                //backgroundColor: '#000',
                paddingVertical: 6,
                paddingHorizontal: 40,
                borderRadius: 9999,
                borderColor: '#000',
                borderWidth: 1.5,
              }}
            >
              <Text color="#000" size="lg" fontFamily='Nunito-700'>
                Reset
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: '#000',
                paddingVertical: 6,
                paddingHorizontal: 40,
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