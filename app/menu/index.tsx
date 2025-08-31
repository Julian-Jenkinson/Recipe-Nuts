import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  Text,
  View,
} from "@gluestack-ui/themed";
import * as InAppPurchases from "expo-in-app-purchases";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
} from "react-native";
import { PrivacyPolicyModal } from "../../components/PrivacyPolicyModal";
import { QuickTourModal } from "../../components/QuickTourModal";
import { RecipeBar } from "../../components/RecipeBar";
import { TAndCModal } from "../../components/TAndCModal";
import { useRecipeStore } from "../../stores/useRecipeStore";
import theme from "../../theme";

export default function Menu() {
  const recipes = useRecipeStore((state) => state.recipes);
  const isPro = useRecipeStore((state) => state.isPro);
  const setPro = useRecipeStore((state) => state.setPro);
  const upgradeToPro = useRecipeStore((state) => state.upgradeToPro);
  const router = useRouter();

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTAndCModal, setShowTAndCModal] = useState(false);
  const [showQuickTourModal, setShowQuickTourModal] = useState(false);
  const [loadingPurchase, setLoadingPurchase] = useState(false);

  // --- In-App Purchase Setup ---
  useEffect(() => {
    let isMounted = true;

    const connectPurchases = async () => {
      await InAppPurchases.connectAsync();

      InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
        if (!isMounted) return;

        if (responseCode === InAppPurchases.IAPResponseCode.OK && results?.length) {
          for (const purchase of results) {
            if (!purchase.acknowledged && purchase.productId === "pro_upgrade") {
              upgradeToPro();
              Alert.alert("Success!", "You are now Pro! 🚀");
              await InAppPurchases.finishTransactionAsync(purchase, false);
            }
          }
        } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
          console.log("Purchase canceled");
        } else {
          console.warn("Purchase error:", errorCode);
          Alert.alert("Purchase Error", "Something went wrong during the purchase.");
        }

        setLoadingPurchase(false);
      });
    };

    connectPurchases();

    return () => {
      isMounted = false;
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const handleUpgrade = async () => {
    if (isPro) {
      return Alert.alert("Already Pro!", "You already have unlimited recipes 🚀");
    }

    try {
      setLoadingPurchase(true);

      const { responseCode, results } = await InAppPurchases.getProductsAsync(["pro_upgrade"]);

      if (responseCode !== InAppPurchases.IAPResponseCode.OK || !results?.length) {
        Alert.alert("Error", "Product not available. Please try again later.");
        setLoadingPurchase(false);
        return;
      }

      await InAppPurchases.purchaseItemAsync("pro_upgrade");
    } catch (err) {
      console.error("Purchase error:", err);
      Alert.alert("Error", "Could not complete purchase. Please try again later.");
      setLoadingPurchase(false);
    }
  };

  const togglePro = () => setPro(!isPro);

  const handleExit = () => {
    Alert.alert("Exit App", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Exit",
        style: "destructive",
        onPress: () => {
          if (Platform.OS === "android") BackHandler.exitApp();
        },
      },
    ]);
  };

  const handleContactPress = async () => {
    const email = "u1133676@gmail.com";
    const subject = "Feedback / Support";
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Could not open email client.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />
      <View style={styles.container}>
        <Box ml={0} mt={48} alignSelf="flex-start">
          <Pressable onPress={() => router.replace("/recipes/")}>
            <Feather name="chevron-left" size={32} color="#333" />
          </Pressable>
        </Box>

        <Text style={styles.heading}>Menu</Text>

        <ScrollView>
          <Box>
            {/* UPGRADE TO PRO */}
            <Pressable
              style={styles.menuItem}
              onPress={handleUpgrade}
              disabled={loadingPurchase}
            >
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons
                  name={isPro ? "lock-open-check-outline" : "lock-open-outline"}
                  style={styles.icon}
                />
                <Text style={styles.text}>{isPro ? "You’re Pro!" : "Upgrade to Pro"}</Text>
                {loadingPurchase && (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.cta}
                    style={{ marginLeft: 10 }}
                  />
                )}
              </HStack>

              {!isPro ? (
                <>
                  <Text style={styles.undertext}>
                    Upgrade to unlock unlimited recipe storage
                  </Text>
                  <Text style={styles.undertext}>
                    {recipes.length} of 10 recipes stored
                  </Text>
                  <Box style={styles.recipebar}>
                    <RecipeBar />
                  </Box>
                </>
              ) : (
                <Box>
                  <Text style={styles.undertext}>Unlimited recipes unlocked</Text>
                  <Pressable onPress={togglePro} style={styles.undertext}>
                    <Text>{isPro ? "Downgrade to Free" : "Upgrade to Pro"}</Text>
                  </Pressable>
                </Box>
              )}

              {/* Dev-only simulate button */}
              {__DEV__ && !isPro && (
                <Pressable
                  onPress={() => {
                    upgradeToPro();
                    Alert.alert("Dev Test", "Simulated Pro upgrade ✅");
                  }}
                  style={{ marginTop: 10 }}
                >
                  <Text style={{ color: "green", marginLeft: 42 }}>Simulate Pro (Dev Only)</Text>
                </Pressable>
              )}
            </Pressable>

            <View style={styles.pagebreak} />

            {/* Other menu items */}
            <Pressable style={styles.menuItem} onPress={() => setShowQuickTourModal(true)}>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons name="map-marker-path" style={styles.icon} />
                <Text style={styles.text}>Quick Tour</Text>
              </HStack>
              <Text style={styles.undertext}>Take a tour of the app</Text>
            </Pressable>

          </Box>

          <View style={styles.pagebreak} />

          {/* Sub Menu */}
          <Box flex={1} style={styles.submenu}>
            <Pressable onPress={() => setShowTAndCModal(true)}>
              <Text style={styles.subtext}>Terms and Conditions</Text>
            </Pressable>

            <Pressable onPress={() => setShowPrivacyModal(true)}>
              <Text style={styles.subtext}>Privacy Policy</Text>
            </Pressable>

            <View style={styles.pagebreak} />

            <Pressable onPress={handleExit}>
              <Text style={styles.exittext}>Exit</Text>
            </Pressable>
          </Box>
        </ScrollView>
      </View>

      {/* Modals */}
      <QuickTourModal isOpen={showQuickTourModal} onClose={() => setShowQuickTourModal(false)} />
      <TAndCModal isOpen={showTAndCModal} onClose={() => setShowTAndCModal(false)} />
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.bg, flex: 1, paddingHorizontal: 16 },
  heading: { fontSize: 26, fontFamily: "body-800", marginTop: 30, marginBottom: 15, marginLeft: 40 },
  text: { fontSize: 18, fontFamily: "body-800", marginLeft: 18 },
  menuItem: { paddingBottom: 10 },
  undertext: { fontSize: 17, fontFamily: "body-400", color: theme.colors.text2, marginLeft: 42, marginTop: 4 },
  recipebar: { marginLeft: 42, marginRight: 42, marginTop: 10, marginBottom: 5 },
  textContainer: { marginTop: 12, marginBottom: 2, alignItems: "center", flexDirection: "row" },
  icon: { color: theme.colors.cta, fontSize: 22 },
  submenu: {},
  subtext: { fontSize: 19, fontFamily: "body-700", marginVertical: 8, marginLeft: 42 },
  exittext: { fontSize: 19, fontFamily: "body-800", marginTop: 10, marginBottom: 40, marginLeft: 42 },
  pagebreak: { height: 1, backgroundColor: "#ddd", marginVertical: 15, marginLeft: 42, marginRight: 42 },
});
