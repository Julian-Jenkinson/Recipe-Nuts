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
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrivacyPolicyModal } from "../../components/PrivacyPolicyModal"; // ✅ NEW
import { RecipeBar } from "../../components/RecipeBar";
import { TAndCModal } from "../../components/TAndCModal"; // ✅ NEW
import { useRecipeStore } from "../../stores/useRecipeStore";
import theme from "../../theme";

export default function Menu() {
  const recipes = useRecipeStore((state) => state.recipes);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false); // Modal state
  const [showTAndCModal, setShowTAndCModal] = useState(false); // Modal state

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Headings */}
        <Text style={styles.heading}>Menu</Text>

        <ScrollView>
          <Box>
            {/* UPGRADE */}
            <Pressable>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons
                  name="lock-open-outline"
                  style={styles.icon}
                />
                <Text style={styles.text}>Upgrade to Pro</Text>
              </HStack>
              <Text style={styles.undertext}>
                Upgrade to unlock unlimited recipe storage
              </Text>
              <Text style={styles.undertext}>
                {recipes.length} of 10 recipes stored
              </Text>
              <Box style={styles.recipebar}>
                <RecipeBar />
              </Box>
            </Pressable>

            {/* QUICK TOUR */}
            <Pressable>
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
            <Pressable>
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
            <Pressable>
              <HStack style={styles.textContainer}>
                <Feather name="share-2" style={styles.icon} />
                <Text style={styles.text}>Share</Text>
              </HStack>
              <Text style={styles.undertext}>
                Share with your friends and family
              </Text>
            </Pressable>

            {/* CONTACT */}
            <Pressable>
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

          {/* SUB MENU */}
          <Box flex={1}>
            {/* TERMS AND CONDITIONS BUTTON */}
            <Pressable onPress={() => setShowTAndCModal(true)}>
              <Text style={styles.subtext}>Terms and Conditions</Text>
            </Pressable>

            {/* PRIVACY POLICY BUTTON */}
            <Pressable onPress={() => setShowPrivacyModal(true)}>
              <Text style={styles.subtext}>Privacy Policy</Text>
            </Pressable>

            <Pressable>
              <Text style={styles.exittext}>Exit</Text>
            </Pressable>
          </Box>
        </ScrollView>
      </View>

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
    padding: 16,
  },
  heading: {
    fontSize: 26,
    fontFamily: "Nunito-900",
    marginTop: 30,
    marginBottom: 20,
  },
  text: {
    fontSize: 22,
    fontFamily: "Nunito-800",
    marginLeft: 8,
  },
  undertext: {
    fontSize: 18,
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
  subtext: {
    fontSize: 20,
    fontFamily: "Nunito-700",
    marginBottom: 10,
  },
  exittext: {
    fontSize: 20,
    fontFamily: "Nunito-900",
    marginBottom: 15,
    marginTop: 15,
  },
});
