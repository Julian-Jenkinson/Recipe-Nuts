import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    Box,
    HStack,
    Pressable,
    ScrollView,
    Text,
    View,
} from "@gluestack-ui/themed";
import React, { useState } from "react";
import { Alert, BackHandler, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrivacyPolicyModal } from "../../../components/PrivacyPolicyModal";
import { QuickTourModal } from "../../../components/QuickTourModal";
import { RecipeBar } from "../../../components/RecipeBar";
import { TAndCModal } from "../../../components/TAndCModal";
import { useRecipeStore } from "../../../stores/useRecipeStore";
import theme from "../../../theme";

export default function Menu() {
  const recipes = useRecipeStore((state) => state.recipes);
  const isPro = useRecipeStore((state) => state.isPro);
  const setPro = useRecipeStore((state) => state.setPro);          // NEW
  const upgradeToPro = useRecipeStore((state) => state.upgradeToPro); // NEW


  const [showPrivacyModal, setShowPrivacyModal] = useState(false); // Modal state
  const [showTAndCModal, setShowTAndCModal] = useState(false); // Modal state
  const [showQuickTourModal, setShowQuickTourModal] = useState(false); // Modal state

  const togglePro = () => setPro(!isPro);

  const handleUpgrade = () => {
    if (isPro) {
      //Alert.alert("Already Pro!", "You already have unlimited recipes 🚀");
      return;
    }
    // For now just simulate upgrade
    Alert.alert(
      "Upgrade to Pro",
      "This will unlock unlimited recipe storage.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upgrade",
          onPress: () => {
            upgradeToPro(); // ✅ mark user as Pro
            Alert.alert("Success", "You have upgraded to Pro! Unlimited recipes unlocked.");
          },
        },
      ]
    );
  };

  // Exit button logic (android only)
  // Potentially conditionaly render the exit button if android device
  const handleExit = () => {
    Alert.alert(
      "Exit App",
      "Are you sure you want to exit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {
            if (Platform.OS === "android") {
              BackHandler.exitApp(); // ✅ Only works on Android
            } else {
              console.log("iOS does not allow programmatic exit");
            }
          },
        },
      ]
    );
  };


  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Headings */}
        <Text style={styles.heading}>Menu</Text>

        <ScrollView>
          <Box>
            {/* UPGRADE TO PRO */}
            <Pressable style={styles.menuItem} onPress={handleUpgrade}>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons
                  name={isPro ? "lock-open-check-outline" : "lock-open-outline"} // ✅ different icon if Pro
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
                <Text style={styles.undertext}>
                  Unlimited recipes unlocked
                </Text>
                  <Pressable onPress={togglePro} style={styles.undertext}>
                    <Text>{isPro ? 'Downgrade to Free' : 'Upgrade to Pro'}</Text>
                  </Pressable>
                </Box>
              )}
            </Pressable>
            


            {/* QUICK TOUR */}
            <Pressable style={styles.menuItem} onPress={() => setShowQuickTourModal(true)}>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons
                  name="map-marker-path"
                  style={styles.icon}
                />
                <Text style={styles.text}>Quick Tour</Text>
              </HStack>
              <Text style={styles.undertext}>Take a tour of the app</Text>
            </Pressable>

            {/* RATE */}
            <Pressable style={styles.menuItem}>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons
                  name="star-outline"
                  style={styles.icon}
                />
                <Text style={styles.text}>Rate</Text>
              </HStack>
              <Text style={styles.undertext}>
                Let others know what you think
              </Text>
            </Pressable>

            {/* SHARE */}
            <Pressable style={styles.menuItem}>
              <HStack style={styles.textContainer}>
                <Feather name="share-2" style={styles.icon} />
                <Text style={styles.text}>Share</Text>
              </HStack>
              <Text style={styles.undertext}>
                Share with your friends and family
              </Text>
            </Pressable>

            {/* CONTACT */}
            <Pressable style={styles.menuItem}>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons
                  name="email-outline"
                  style={styles.icon}
                />
                <Text style={styles.text}>Contact Us</Text>
              </HStack>
              <Text style={styles.undertext}>
                Leave feedback or get in touch for support
              </Text>
              <Text style={styles.undertext}>
                Leave feedback or get in touch for support
              </Text>
            </Pressable>
          </Box>

          {/* SUB MENU */}
          <Box flex={1} style={styles.submenu}>
            {/* TERMS AND CONDITIONS BUTTON */}
            <Pressable onPress={() => setShowTAndCModal(true)}>
              <Text style={styles.subtext}>Terms and Conditions</Text>
            </Pressable>

            {/* PRIVACY POLICY BUTTON */}
            <Pressable onPress={() => setShowPrivacyModal(true)}>
              <Text style={styles.subtext}>Privacy Policy</Text>
            </Pressable>

            <Pressable onPress={handleExit}>
              <Text style={styles.exittext}>Exit</Text>
            </Pressable>
          </Box>
        </ScrollView>
      </View>

      {/* Quick Tour Modal */}
      <QuickTourModal
        isOpen={showQuickTourModal}
        onClose={() => setShowQuickTourModal(false)}
      />

      {/* Terms and Conditions Modal */}
      <TAndCModal
        isOpen={showTAndCModal}
        onClose={() => setShowTAndCModal(false)}
      />
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg,
    flex: 1,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 26,
    fontFamily: "Nunito-800",
    marginTop: 30,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontFamily: "Nunito-800",
    marginLeft: 8,
  },
  menuItem: {
    paddingBottom:10,
  },

  undertext: {
    fontSize: 17,
    fontFamily: "Nunito-400",
    color: theme.colors.text2,
    marginLeft: 32,
  },
  recipebar: {
    marginLeft: 32,
    marginTop: 6,
  },
  textContainer: {
    marginTop: 12,
    marginBottom: 2,
    alignItems: "center",
  },
  icon: {
    color: theme.colors.cta,
    fontSize: 22,
  },
  submenu: {
    //paddingTop: 10,
  },
  subtext: {
    fontSize: 19,
    fontFamily: "Nunito-700",
    marginTop: 20,
  },
  exittext: {
    fontSize: 19,
    fontFamily: "Nunito-800",
    marginTop: 20,
    marginBottom: 20,
  },
});
