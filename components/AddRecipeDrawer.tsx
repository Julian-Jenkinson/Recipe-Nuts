import { Feather } from '@expo/vector-icons';
import {
  Box,
  HStack,
  Pressable,
  StatusBar,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,

  StyleSheet,
} from 'react-native';
import { useRecipeStore } from '../stores/useRecipeStore';
import theme from '../theme';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddRecipeDrawer({ isOpen, onClose }: Props) {
  const router = useRouter();
  
  // Access recipe data and pro status
  const recipes = useRecipeStore((state) => state.recipes);
  const isPro = useRecipeStore((state) => state.isPro);
  
  // Check if free tier limit is reached
  const hasReachedLimit = !isPro && recipes.length >= 10;

  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const currentTranslateY = React.useRef(0);
  const { height } = Dimensions.get('window');
  const drawerHeight = 250;

  React.useEffect(() => {
    if (isOpen) {
      translateY.setValue(0);
      currentTranslateY.current = 0;
      
      // Simple, gentle fade-in for backdrop and smooth slide for drawer
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]).start();
    } else {
      // Animate backdrop and drawer out together
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.bezier(0.55, 0.06, 0.68, 0.19),
        }),
      ]).start();
    }
  }, [isOpen, slideAnim, backdropOpacity]);

  const drawerTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  // Create PanResponder for swipe gestures
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Only respond to vertical movements > 10px
          return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        },
        onPanResponderGrant: () => {
          // Store the current value when gesture starts
          translateY.setOffset(currentTranslateY.current);
        },
        onPanResponderMove: (evt, gestureState) => {
          // Only allow downward movement (positive dy)
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            
            // Dynamically fade backdrop based on swipe progress
            const progress = Math.min(gestureState.dy / 200, 1);
            const newOpacity = 1 - progress;
            backdropOpacity.setValue(Math.max(newOpacity, 0));
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          // Close drawer if swiped down > 100px or with high velocity
          const shouldClose = gestureState.dy > 100 || gestureState.vy > 0.5;
          
          if (shouldClose) {
            // Animate backdrop out quickly, then close modal
            Animated.timing(backdropOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              onClose(); // Close modal after backdrop fades
            });
            
            // Animate drawer off screen
            translateY.flattenOffset();
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => {
              // Reset values after animation completes
              translateY.setValue(0);
              currentTranslateY.current = 0;
            });
          } else {
            // Snap back to original position
            translateY.flattenOffset();
            currentTranslateY.current = 0;
            
            // Restore backdrop opacity and snap drawer back
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 8,
              }),
              Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          }
        },
      }),
    [translateY, backdropOpacity, onClose, height]
  );

  const combinedTranslateY = Animated.add(drawerTranslateY, translateY);

  return (
    <Modal
      visible={isOpen}
      transparent
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
    >
      
      <StatusBar backgroundColor={theme.colors.cta} barStyle="light-content" />
      
      {/* Simplified Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable
          style={styles.backdropPressable}
          onPress={() => {
            // Animate backdrop and drawer out together
            Animated.parallel([
              Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
                easing: Easing.in(Easing.quad),
              }),
              Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.bezier(0.55, 0.06, 0.68, 0.19),
              }),
            ]).start(() => {
              onClose();
            });
          }}
        />
      </Animated.View>
      
      {/* Drawer Content with Pan Gesture */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateY: combinedTranslateY }] }]}
        {...panResponder.panHandlers}
      >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Box style={styles.drawerContent}>
              {/* Drag Indicator */}
              <Box alignItems="center" pb={8}>
                <Box style={styles.dragIndicator} />
              </Box>

              {/* Header */}
      
              <Text style={styles.headerText}>
                Add Recipe
              </Text>
    

              {/* Page Break */}
              <View style={{ height: 1, backgroundColor: '#E5E5E5', marginBottom: 20 }} />

              {/* Body */}
              <VStack gap={20}>
                {hasReachedLimit && (
                  <Text style={styles.limitText}>
                    Free tier limit reached. Upgrade to add more recipes.
                  </Text>
                )}
                
                {!hasReachedLimit && (
                  <>
                    <Pressable
                      onPress={() => {
                        onClose();
                        router.push('/add/AddFromURL');
                      }}
                      style={styles.actionPressable}
                    >
                      <HStack alignItems="center">
                        <Feather name="link" size={20} color="#000" />
                        <Text style={styles.actionText}>
                          Add recipe from link
                        </Text>
                      </HStack>
                    </Pressable>
                    
                    <Pressable
                      onPress={() => {
                        onClose();
                        router.push('/add/AddBlankRecipe');
                      }}
                      style={[styles.actionPressable, { paddingTop: 0 }]}
                    >
                      <HStack alignItems="center">
                        <Feather name="plus" size={20} color="#000" />
                        <Text style={styles.actionText}>
                          Create new recipe
                        </Text>
                      </HStack>
                    </Pressable>
                  </>
                )}
                
                {hasReachedLimit && (
                  <Pressable
                    onPress={() => {
                      onClose();
                      router.push('/menu');
                    }}
                    style={styles.upgradePressable}
                  >
                    <Text style={styles.upgradeText}>
                      Upgrade Now
                    </Text>
                  </Pressable>
                )}
              </VStack>
            </Box>
          </Pressable>
        </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 55,
    minHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  headerText: {
    fontFamily: 'body-800',
    fontSize: 22,
    color: '#000',
    paddingTop:10,
    paddingBottom:20,
  },
  limitText: {
    fontFamily: 'body-600',
    fontSize: 16,
    color: '#333',
    paddingBottom: 10,
    textAlign: 'center',
  },
  actionPressable: {
    paddingVertical: 4,
  },
  actionText: {
    fontFamily: 'body-600',
    fontSize: 20,
    paddingLeft: 12,
    color: '#000',
  },
  upgradePressable: {
    alignSelf: 'center',
    marginTop: 10,
  },
  upgradeText: {
    fontFamily: 'body-600',
    fontSize: 18,
    color: theme.colors.cta,
  },
});
