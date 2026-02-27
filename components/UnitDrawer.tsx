import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  HStack,
  Pressable,
  StatusBar,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed';
import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  StyleSheet,
} from 'react-native';
import theme from '../theme';

type UnitMode = 'original' | 'imperial' | 'metric';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedUnit: UnitMode;
  onUnitSelect: (unit: UnitMode) => void;
};

const optionIconColor = '#000';

const unitOptions: { key: UnitMode; label: string; icon: React.ReactNode }[] = [
  {
    key: 'original',
    label: 'Original',
    icon: <MaterialCommunityIcons name="book-open-outline" size={22} color={optionIconColor} />,
  },
  {
    key: 'imperial',
    label: 'Imperial',
    icon: (
      <View style={{ transform: [{ rotate: '45deg' }] }}>
        <MaterialIcons name="straighten" size={22} color={optionIconColor} />
      </View>
    ),
  },
  {
    key: 'metric',
    label: 'Metric',
    icon: <MaterialCommunityIcons name="flask-outline" size={22} color={optionIconColor} />,
  },
];

export default function UnitDrawer({
  isOpen,
  onClose,
  onUnitSelect,
  selectedUnit,
}: Props) {
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const currentTranslateY = React.useRef(0);
  const { height } = Dimensions.get('window');

  React.useEffect(() => {
    if (isOpen) {
      translateY.setValue(0);
      currentTranslateY.current = 0;

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
  }, [isOpen, slideAnim, backdropOpacity, translateY]);

  const drawerTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) =>
          Math.abs(gestureState.dy) > 10 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          translateY.setOffset(currentTranslateY.current);
        },
        onPanResponderMove: (evt, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            const progress = Math.min(gestureState.dy / 200, 1);
            backdropOpacity.setValue(Math.max(1 - progress, 0));
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          const shouldClose = gestureState.dy > 100 || gestureState.vy > 0.5;
          if (shouldClose) {
            Animated.timing(backdropOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              onClose();
            });

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
              translateY.setValue(0);
              currentTranslateY.current = 0;
            });
          } else {
            translateY.flattenOffset();
            currentTranslateY.current = 0;
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
    [translateY, backdropOpacity, onClose, height, slideAnim]
  );

  const combinedTranslateY = Animated.add(drawerTranslateY, translateY);

  const closeWithAnimation = () => {
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
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
    >
      <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />

      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={styles.backdropPressable} onPress={closeWithAnimation} />
      </Animated.View>

      <Animated.View
        style={[styles.drawer, { transform: [{ translateY: combinedTranslateY }] }]}
        {...panResponder.panHandlers}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Box style={styles.drawerContent}>
            <Box alignItems="center" pb={8}>
              <Box style={styles.dragIndicator} />
            </Box>

            <Box mb={15}>
              <Text style={styles.headerText}>Choose Units</Text>
            </Box>

            <View style={styles.divider} />

            <VStack gap={15}>
              {unitOptions.map((option) => (
                <Pressable
                  key={option.key}
                  style={styles.actionPressable}
                  onPress={() => {
                    onUnitSelect(option.key);
                    closeWithAnimation();
                  }}
                >
                  <HStack alignItems="center" justifyContent="space-between">
                    <HStack alignItems="center" gap={10}>
                      {option.icon}
                      <Text style={styles.actionText}>{option.label}</Text>
                    </HStack>
                    {selectedUnit === option.key ? (
                      <MaterialIcons name="check" size={22} color={theme.colors.cta} />
                    ) : (
                      <View style={{ width: 22, height: 22 }} />
                    )}
                  </HStack>
                </Pressable>
              ))}
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
    fontSize: 20,
    color: '#000',
    paddingTop: 5,
  },
  divider: { height: 1, backgroundColor: '#E5E5E5', marginBottom: 20 },
  actionPressable: {
    paddingVertical: 4,
  },
  actionText: {
    fontFamily: 'body-600',
    fontSize: 18,
    color: '#000',
    paddingLeft: 12,
  },
});
