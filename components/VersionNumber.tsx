import { Text } from "@gluestack-ui/themed";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";
import theme from "../theme";

export const VersionNumber = () => {
  const version = Constants.expoConfig?.version ?? "67";
  const commit = Constants.expoConfig?.extra?.commitCount ?? "0";

  return (
    <Text style={styles.versionText}>
      v{version} + {commit}
    </Text>
  );
};

const styles = StyleSheet.create({ 
  versionText: {
    textAlign:'left',
    fontSize: 14, 
    paddingLeft: 42,
    paddingVertical: 20,
    fontFamily: "body-400", 
    color: theme.colors.text2,
  }
});
