import {
  Button, ButtonText, CloseIcon, Heading, HStack, Icon, Modal,
  ModalBackdrop, ModalCloseButton, ModalContent, ModalHeader, Pressable,
  Text, VStack
} from "@gluestack-ui/themed";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert, Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView,
  StatusBar, StyleSheet, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecipeStore } from "../stores/useRecipeStore";
import theme from "../theme";
import { fetchPaywallPackage, purchasePackage } from '../utils/revenueCat';

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
  const syncCustomerInfo = useRecipeStore((state) => state.syncCustomerInfo);
  const [upgradePrice, setUpgradePrice] = useState<string | null>(null);

  useEffect(() => {
    const loadPackage = async () => {
      const pkg = await fetchPaywallPackage("default");
      if (pkg) {
        setUpgradePrice(pkg.product.priceString); // e.g. "$3.99" with correct locale
      }
    };

    if (isOpen) {
      loadPackage();
    }
  }, [isOpen]);


  const pages = [
    { title: "Welcome to Recipe Nuts", 
      text: "Save and organize your favorite recipes with ease." },
    { title: "Import From Your Favourite Sites", 
      text: "Paste the recipe URL into the add recipe tab to extract just the important bits. No blogs! No backstories!" },
    { title: "Get Started for Free", 
      text: `Start your collection with storage for up to 10 recipes. Upgrade for a one time fee of ${upgradePrice ?? "…" } to get unlimited.`, 
      showUpgrade: true },
    { title: "Share & Explore", 
      text: "Share recipes with friends or browse your collection for your next meal!", 
      isLast: true },
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

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentPage + 1) * width,
        animated: true,
      });
    } else {
      onClose();
    }
  };

  const handleUpgrade = async () => {
      const pkg = await fetchPaywallPackage("default");
      if (!pkg) return Alert.alert("Purchase not available");
  
      try {
        await purchasePackage(pkg);
        // Sync store state with RevenueCat
        await syncCustomerInfo();
  
        Alert.alert(
          "Success",
          "You have upgraded to Pro! Unlimited recipes unlocked."
        );
      } catch (e: any) {
        if (!e.userCancelled) {
          Alert.alert("Purchase failed", e.message);
        }
      }
    };

//check status bar colour is working properly - this will be in effect in NEXT build

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" animationDuration="0" >
      <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />
    
      <ModalBackdrop />
      <ModalContent style={styles.modal}>
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
          {/* Header */}
          <ModalHeader>
            <Heading size="md" style={styles.headerTitle}></Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} size='lg' color="#777" />
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
                    <Button
                      onPress={handleUpgrade}
                      mt="$4"
                      style={{
                        backgroundColor: theme.colors.cta,
                        borderRadius: 8,
                        paddingHorizontal: 20,
                      }}
                    >
                      <ButtonText style={styles.buttonText}>Upgrade</ButtonText>
                    </Button>
                  )}

                  {page.isLast && (
                    <Button
                      mt="$4"
                      style={{
                        backgroundColor: theme.colors.cta,
                        borderRadius: 8,
                        paddingHorizontal: 20,
                      }}
                      onPress={onClose}
                    >
                      <ButtonText style={styles.buttonText}>Got it!</ButtonText>
                    </Button>
                  )}
                </VStack>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <HStack justifyContent="space-between" alignItems="center" px="$6" mb="$4">
            <Pressable onPress={onClose}>
              <Text style={styles.skipText}>SKIP</Text>
            </Pressable>

            {/* Dot indicators */}
          <HStack justifyContent="center" space="sm">
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

            <Pressable onPress={handleNext}>
              <Text style={styles.skipText}>
                {currentPage === pages.length - 1 ? "DONE" : "NEXT"}
              </Text>
            </Pressable>
          </HStack>

        </SafeAreaView>
      </ModalContent>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    borderRadius: 0,
  },
  headerTitle: {
    fontFamily: "body-400",
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
    fontFamily: "body-800",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  pageText: {
    fontFamily: "body-400",
    fontSize: 20,
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
    fontFamily: "body-800",
    fontSize: 18,
    color: "white",
  },
  skipText: {
    fontFamily: "body-700",
    fontSize: 16,
    color: "#777",
    paddingVertical: 3,
  },
});
