import {
  Button,
  ButtonText,
  CloseIcon,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBackdrop,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Pressable,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../theme";


const { width, height } = Dimensions.get("window");

export function QuickTourModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const pages = [
    { title: "Welcome to Recipe Nuts", text: "Save and organize your favorite recipes with ease." },
    { title: "Import From Your Favourite Sites", text: "Paste the recipe URL into the add recipe tab to extract just the important bits. No blogs! No backstories!" },
    { title: "Get Started for Free", text: "Start your collection with storage for up to 10 recipes. Upgrade for a one time fee of $3.99 to get unlimited.", showUpgrade: true },
    { title: "Share & Explore", text: "Share recipes with friends or browse your collection for your next meal!", isLast: true },
  ];

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / width);
    setCurrentPage(pageIndex);
  };

  // Reset to first page whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalBackdrop />
      <ModalContent style={{ flex: 1 }}>
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>

          {/* Header */}
          <ModalHeader>
            <Heading size="md" style={styles.headerTitle}></Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} size="md" color='#777' />
            </ModalCloseButton>
          </ModalHeader>

          {/* Scrollable tour */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {pages.map((page, index) => (
              <View key={index} style={styles.page}>
                <VStack space="md" alignItems="center" justifyContent="center" flex={1}>
                  <Heading size="lg" style={styles.pageTitle}>{page.title}</Heading>
                  <Text style={styles.pageText}>{page.text}</Text>

                  {page.showUpgrade && (
                    <Button mt="$4" style={{ backgroundColor: theme.colors.cta, borderRadius: 8, paddingHorizontal: 20 }}>
                      <ButtonText style={styles.buttonText}>Upgrade</ButtonText>
                    </Button>
                  )}

                  {page.isLast && (
                    <Button mt="$4" style={{ backgroundColor: theme.colors.cta, borderRadius: 8, paddingHorizontal: 20 }} onPress={onClose}>
                      <ButtonText style={styles.buttonText}>Got it!</ButtonText>
                    </Button>
                  )}
                </VStack>
              </View>
            ))}
          </ScrollView>

          {/* Dot indicators */}
          <HStack justifyContent="center" space="sm" mb="$2">
            {pages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentPage === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </HStack>

          {/* Bottom Skip */}
          <HStack justifyContent="center" mb="$4">
            <Pressable onPress={onClose}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </HStack>

        </SafeAreaView>
      </ModalContent>
    </Modal>
  );
}


const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: "Nunito-900",
    fontSize: 20,
  },
  page: {
    width: width,
    height: height * 0.75,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontFamily: "Nunito-900",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  pageText: {
    fontFamily: "Nunito-400",
    fontSize: 18,
    textAlign: "center",
    color: theme.colors.text2,
    paddingHorizontal: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeDot: {
    backgroundColor: theme.colors.cta,
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    fontFamily: "Nunito-800",
    fontSize: 18,
    color: "white",
  },
  skipText: {
    fontFamily: "Nunito-400",
    fontSize: 18,
    color: "#777",
    paddingVertical: 3,
  },
});
