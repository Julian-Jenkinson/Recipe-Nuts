import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, BackHandler, Linking, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrivacyPolicyModal } from "../../components/PrivacyPolicyModal";
import { QuickTourModal } from "../../components/QuickTourModal";
import { RecipeBar } from "../../components/RecipeBar";
import { TAndCModal } from "../../components/TAndCModal";
import { useRecipeStore } from "../../stores/useRecipeStore";
import theme from "../../theme";


export default function Menu() {
  const recipes = useRecipeStore((state) => state.recipes);
  const isPro = useRecipeStore((state) => state.isPro);
  const setPro = useRecipeStore((state) => state.setPro);          // NEW
  const upgradeToPro = useRecipeStore((state) => state.upgradeToPro); // NEW
  const router = useRouter();


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

  const handleContactPress = async () => {
    if (Platform.OS !== 'android') return;

    const email = 'u1133676@gmail.com';
    const subject = 'Feedback / Support';
    const body = '';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error('Failed to open email client:', err);
      Alert.alert(
        'Error',
        'Could not open email client. Please make sure you have an email app installed.'
      );
    }
  };


  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />
      <View style={styles.container}>
        
        <Box ml={0} mt={8} alignSelf="flex-start">
          <Pressable onPress={() => router.replace('/recipes/')}>
            <Feather name="chevron-left" size={32} color="#333" />
          </Pressable>
        </Box>
        
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
            
            <View style={styles.pagebreak} />

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

            <View style={styles.pagebreak} />

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

            <View style={styles.pagebreak} />

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

            <View style={styles.pagebreak} />

            {/* CONTACT */}
            <Pressable style={styles.menuItem} onPress={handleContactPress}>
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
            </Pressable>
          </Box>

          <View style={styles.pagebreak} />

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

            <View style={styles.pagebreak} />

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
    fontFamily: "body-800",
    marginTop: 30,
    marginBottom: 15,
    marginLeft:40,
  },
  text: {
    fontSize: 18,
    fontFamily: "body-800",
    marginLeft: 18,
  },
  menuItem: {
    paddingBottom:10,
  },

  undertext: {
    fontSize: 17,
    fontFamily: "body-400",
    color: theme.colors.text2,
    marginLeft: 42,
    marginTop: 4,
  },
  recipebar: {
    marginLeft: 42,
    marginRight:42,
    marginTop: 10,
    marginBottom: 5,
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
    
  },
  subtext: {
    fontSize: 19,
    fontFamily: "body-700",
    marginVertical: 8,
    marginLeft: 42,
  },
  exittext: {
    fontSize: 19,
    fontFamily: "body-800",
    marginTop: 10,
    marginBottom: 40,
    marginLeft: 42,
  },
  pagebreak: {
    height: 1, 
    backgroundColor: '#ddd', 
    marginVertical: 15,
    marginLeft: 42,
    marginRight: 42,
  },
});
