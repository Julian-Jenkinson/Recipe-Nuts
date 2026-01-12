import { Text } from "@gluestack-ui/themed";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";
import theme from "../theme";

export const VersionNumber = () => {
  const version =
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??  //keep constants to work in expo go
    "0.0";

  const build =
    Application.nativeBuildVersion ?? "0";

  return (
    <Text style={styles.versionText}>
      v{version} ({build})
    </Text>
  );
};

const styles = StyleSheet.create({
  versionText: {
    textAlign: "center",
    fontSize: 14,
    paddingBottom: 65,
    paddingVertical: 10,
    fontFamily: "body-400",
    color: theme.colors.text2,
  },
});
