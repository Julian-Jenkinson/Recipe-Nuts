import { Text } from "@gluestack-ui/themed";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";
import theme from "../theme";

export const VersionNumber = () => {
  const version = Constants.nativeAppVersion ?? "0";
  const build = Constants.nativeBuildVersion ?? "0";

  return (
    <Text style={styles.versionText}>
      v{version} ({build})
    </Text>
  );
};

const styles = StyleSheet.create({ 
  versionText: {
    textAlign:'center',
    fontSize: 14, 
    //textAlign:'left',
    //paddingLeft: 42,
    paddingBottom:65,
    paddingVertical: 10,
    fontFamily: "body-400", 
    color: theme.colors.text2,
  }
});
