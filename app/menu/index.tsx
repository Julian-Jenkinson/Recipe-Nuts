import { VersionNumber } from "@/components/VersionNumber";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Box, HStack, Pressable, ScrollView, Text, View } from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Platform, Share, StatusBar, StyleSheet } from "react-native";
import { QuickTourModal } from "../../components/QuickTourModal";
import { RecipeBar } from "../../components/RecipeBar";
import { useRecipeStore } from "../../stores/useRecipeStore";
import theme from "../../theme";
import { fetchPaywallPackage, purchasePackage } from '../../utils/revenueCat';

export default function Menu() {
  const recipes = useRecipeStore((state) => state.recipes);
  const isPro = useRecipeStore((state) => state.isPro);
  const syncCustomerInfo = useRecipeStore((state) => state.syncCustomerInfo);
  const ingredientUnitPreference = useRecipeStore(
    (state) => state.ingredientUnitPreference
  );
  const setIngredientUnitPreference = useRecipeStore(
    (state) => state.setIngredientUnitPreference
  );
  const router = useRouter();
  const [showQuickTourModal, setShowQuickTourModal] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  // Ensure local Pro state is synced with RevenueCat on mount
  useEffect(() => {
    const fetchProStatus = async () => {
      try {
        await syncCustomerInfo();
      } catch (err) {
        console.warn("⚠️ Failed to sync customer info:", err);
      }
    };
    fetchProStatus();
  }, []);

  const openURL = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.warn("Failed to open URL:", err);
      Alert.alert("Error", "Could not open the link.");
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

  const handleContactPress = async () => {
    if (Platform.OS !== 'android') return;

    const email = 'hello@recipenuts.app';
    const subject = 'Feedback / Support';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error('Failed to open email client:', err);
      Alert.alert('Error', 'Could not open email client. Make sure you have an email app installed.');
    }
  };

  

  const openStoreReview = async () => {
    const androidPackage = "com.hulio.recipenuts"; 
    const iosAppId = "<PLACEHOLDER>";            // placeholder

    try {
      if (Platform.OS === "android") {
        await Linking.openURL(`market://details?id=${androidPackage}`);
      } else {
        await Linking.openURL(
          `itms-apps://itunes.apple.com/app/id${iosAppId}?action=write-review`
        );
      }
    } catch (error) {
      // Fallback to web
      if (Platform.OS === "android") {
        Linking.openURL(
          `https://play.google.com/store/apps/details?id=${androidPackage}`
        );
      } else {
        Linking.openURL(
          `https://apps.apple.com/app/id${iosAppId}?action=write-review`
        );
      }
    }
  };

  const handleRestore = async () => {
    try {
      await syncCustomerInfo(); // RevenueCat syncs purchases
      if (isPro) {
        Alert.alert("Restored!", "Your Pro subscription has been restored.");
      } else {
        Alert.alert("Nothing to restore", "No previous purchases found.");
      }
    } catch (err) {
      console.warn("Restore failed:", err);
      Alert.alert("Error", "Failed to restore purchases. Try again later.");
    }
  };

  const handleShare = async () => {
    try {
      const androidUrl =
        "https://play.google.com/store/apps/details?id=com.hulio.recipenuts";

      const iosUrl =
        "https://apps.apple.com/app/idYOUR_APP_ID"; // replace when live

      const storeUrl = Platform.OS === "android" ? androidUrl : iosUrl;

      await Share.share({
        message: `Check out RecipeNuts — an easy way to save, organise, and cook your favourite recipes!\n\n${storeUrl}`,
        title: "RecipeNuts App"
      });
    } catch (error) {

      console.error(error);
    }
  };




  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />
      <View style={styles.container}>

        <Box ml={0} mt={58} alignSelf="flex-start">
          <Pressable onPress={() => router.replace('/recipes/')}>
            <Feather name="chevron-left" size={32} color="#333" />
          </Pressable>
        </Box>

        <Text style={styles.heading}>Settings</Text>

        <ScrollView>
          <Box>
            {/* UPGRADE TO PRO */}
            <Pressable style={styles.menuItem} onPress={handleUpgrade}>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons
                  name={isPro ? "lock-open-check-outline" : "lock-open-outline"}
                  style={styles.icon}
                />
                <Text style={styles.text}>
                  {isPro ? "You’re Pro!" : "Upgrade to Pro"}
                </Text>
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
                </Box>
              )}
            </Pressable>

            <View style={styles.pagebreak} />

            {/* RESTORE PURCHASE */}
            {!isPro && (
              <>
            <Pressable 
              style={styles.menuItem} 
              onPress={handleRestore} 
              disabled={isPro}
            >
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons name="restore" style={styles.icon} />
                <Text style={styles.text}>Restore Purchase</Text>
              </HStack>
                <Text style={styles.undertext}>Restore your previous Pro purchase</Text>
            </Pressable>

            <View style={styles.pagebreak} />
            </>
            )}

            {/* QUICK TOUR */}
            <Pressable style={styles.menuItem} onPress={() => setShowQuickTourModal(true)}>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons name="map-marker-path" style={styles.icon} />
                <Text style={styles.text}>Quick Tour</Text>
              </HStack>
              <Text style={styles.undertext}>Take a tour of the app</Text>
            </Pressable>

            <View style={styles.pagebreak} />

            {/* INGREDIENT UNITS */}
            <Pressable style={styles.menuItem}>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons name="scale-balance" style={styles.icon} />
                <Text style={styles.text}>Ingredient Units</Text>
              </HStack>
              <Text style={[styles.undertext, styles.undertextConstrained]}>
                Set default ingredient display for recipe pages
              </Text>
              <Box style={styles.dropdownWrap}>
                <Pressable
                  style={styles.dropdownTrigger}
                  onPress={() => setShowUnitDropdown((current) => !current)}
                >
                  <Text style={styles.dropdownTriggerText}>
                    {ingredientUnitPreference === 'default'
                      ? 'Default'
                      : ingredientUnitPreference === 'imperial'
                      ? 'Imperial'
                      : 'Metric'}
                  </Text>
                  <Feather
                    name={showUnitDropdown ? 'chevron-up' : 'chevron-down'}
                    style={styles.dropdownChevron}
                  />
                </Pressable>
                {showUnitDropdown && (
                  <Box style={styles.dropdownMenu}>
                    {(['default', 'imperial', 'metric'] as const).map((option) => (
                      <Pressable
                        key={option}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setIngredientUnitPreference(option);
                          setShowUnitDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            ingredientUnitPreference === option && styles.dropdownOptionTextActive,
                          ]}
                        >
                          {option === 'default'
                            ? 'Default'
                            : option === 'imperial'
                            ? 'Imperial'
                            : 'Metric'}
                        </Text>
                      </Pressable>
                    ))}
                  </Box>
                )}
              </Box>
            </Pressable>

            <View style={styles.pagebreak} />

            {/* RATE */}
            <Pressable style={styles.menuItem} onPress={openStoreReview}>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons name="star-outline" style={styles.icon} />
                <Text style={styles.text}>Rate</Text>
              </HStack>
              <Text style={styles.undertext}>Let others know what you think</Text>
            </Pressable>

            <View style={styles.pagebreak} />

            {/* SHARE */}
            <Pressable style={styles.menuItem} onPress={handleShare}>
              <HStack style={styles.textContainer}>
                <Feather name="share-2" style={styles.icon} />
                <Text style={styles.text}>Share</Text>
              </HStack>
              <Text style={styles.undertext}>Share with your friends and family</Text>
            </Pressable>

            <View style={styles.pagebreak} />

            {/* CONTACT */}
            <Pressable style={styles.menuItem} onPress={handleContactPress}>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons name="email-outline" style={styles.icon} />
                <Text style={styles.text}>Contact Us</Text>
              </HStack>
              <Text style={styles.undertext}>Leave feedback or get in touch for support</Text>
            </Pressable>
          </Box>

          <View style={styles.pagebreak} />

          {/* SUB MENU */}
          <Box flex={1} style={styles.submenu}>
            <Pressable onPress={ () => openURL("https://www.recipenuts.app/terms.html")}>
              <Text style={styles.subtext}>Terms and Conditions</Text>
            </Pressable>

            <Pressable onPress={() => openURL("https://www.recipenuts.app/privacy.html")}>
              <Text style={styles.subtext}>Privacy Policy</Text>
            </Pressable>
          </Box>
        </ScrollView>
        <VersionNumber/>
      </View>

      <QuickTourModal isOpen={showQuickTourModal} onClose={() => setShowQuickTourModal(false)} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.bg, flex: 1, paddingHorizontal: 16 },
  heading: { fontSize: 26, fontFamily: "body-900", marginTop: 20, marginBottom: 20, marginLeft: 38 },
  text: { fontSize: 18, fontFamily: "body-800", marginLeft: 18 },
  menuItem: { paddingBottom: 10 },
  undertext: { fontSize: 17, fontFamily: "body-400", color: theme.colors.text2, marginLeft: 42, marginTop: 4 },
  undertextConstrained: { marginRight: 42, flexShrink: 1 },
  recipebar: { marginLeft: 42, marginRight: 42, marginTop: 10, marginBottom: 5 },
  textContainer: { marginTop: 12, marginBottom: 2, alignItems: "center" },
  icon: { color: theme.colors.cta, fontSize: 22 },
  dropdownWrap: { marginTop: 10, marginLeft: 42, marginRight: 42 },
  dropdownTrigger: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    //backgroundColor: theme.colors.paper,
  },
  dropdownTriggerText: { fontSize: 15, fontFamily: "body-400", color: theme.colors.text1 },
  dropdownChevron: { color: theme.colors.text2, fontSize: 20 },
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    //backgroundColor: theme.colors.paper,
    overflow: 'hidden',
  },
  dropdownOption: { paddingHorizontal: 12, paddingVertical: 10 },
  dropdownOptionText: { fontSize: 15, fontFamily: "body-400", color: theme.colors.text1 },
  dropdownOptionTextActive: { color: theme.colors.cta, fontFamily: "body-700" },
  submenu: {},
  subtext: { fontSize: 19, fontFamily: "body-700", marginVertical: 8, marginLeft: 42 },
  exittext: { fontSize: 19, fontFamily: "body-800", marginTop: 10, marginBottom: 20, marginLeft: 42 },
  pagebreak: { height: 1, backgroundColor: '#ddd', marginVertical: 15, marginLeft: 42, marginRight: 42 },
});
