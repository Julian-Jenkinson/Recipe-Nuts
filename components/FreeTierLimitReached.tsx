import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import theme from "../theme";

export function FreeTierLimitReached({
  currentCount,
  maxFree,
  onUpgrade,
}: {
  currentCount: number;
  maxFree: number;
  onUpgrade: () => void;
}) {
  const wiggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startWiggle = () => {
      Animated.sequence([
        Animated.timing(wiggleAnim, {
          toValue: 1,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(wiggleAnim, {
          toValue: -1,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(wiggleAnim, {
          toValue: 1,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(wiggleAnim, {
          toValue: 0,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Small delay then repeat
        setTimeout(startWiggle, 2000);
      });
    };

    startWiggle();
  }, []);

  const rotate = wiggleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-10deg", "10deg"],
  });

  return (
    <View style={styles.container}>
      {/* Animated lock */}
      <Animated.View style={{ transform: [{ rotate }] }}>
        <MaterialCommunityIcons
          name="lock"
          size={64}
          color={theme.colors.cta}
        />
      </Animated.View>

      <Text style={styles.title}>Free Tier Limit Reached</Text>
      <Text style={styles.text}>
        You’ve reached your free limit of<Text style={{ fontWeight: "bold" }}>{currentCount}</Text> recipes. Upgrade to Pro for unlimited recipe storage
      </Text>
      

      <Pressable onPress={onUpgrade} style={styles.button}>
        <Text style={styles.buttonText}>Unlock Unlimited Recipes</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: "Nunito-700",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    fontFamily: "Nunito-400",
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  button: {
    marginTop: 30,
    backgroundColor: theme.colors.cta,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Nunito-700",
    color: "#fff",
  },
});
