import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text, View } from '@gluestack-ui/themed';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../theme';



export default function Menu() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        
        {/*Headings*/}
        <Text style={styles.heading}>Menu</Text>
        
        <Box>
          <Pressable>
            <HStack style={styles.textContainer}>
              <MaterialCommunityIcons name="lock-open-outline" style={styles.icon} />
              <Text style={styles.text}>Upgrade to Pro</Text>
            </HStack>
          </Pressable>  
          <Pressable>
            <HStack style={styles.textContainer}>
              <MaterialCommunityIcons name="star-outline" style={styles.icon} />
              <Text style={styles.text}>Rate</Text>
            </HStack>
          </Pressable>
          <Pressable>
            <HStack style={styles.textContainer}>
              <MaterialCommunityIcons name="map-marker-path" style={styles.icon} />
              <Text style={styles.text}>Quick Tour</Text>
            </HStack>
          </Pressable>
          <Pressable>
            <HStack style={styles.textContainer}>
              <Feather name="share-2" style={styles.icon} />
              <Text style={styles.text}>Share</Text>
            </HStack>
          </Pressable>
          {/*
          <Pressable>
            <HStack style={styles.textContainer}>
              <MaterialCommunityIcons name="help-circle-outline" style={styles.icon} />
              <Text style={styles.text}>FAQ</Text>
            </HStack>
          </Pressable>
          */}
          <Pressable>
            <HStack style={styles.textContainer}>
              <MaterialCommunityIcons name="email-outline" style={styles.icon} />
              <Text style={styles.text}>Contact Us</Text>
            </HStack>
          </Pressable>
          {/*
          <Pressable>
            <HStack style={styles.textContainer}>
              <MaterialCommunityIcons name="cog-outline" style={styles.icon} />
              <Text style={styles.text}>Settings</Text>
            </HStack>
          </Pressable>
          */}
        </Box>
        
        {/*SubHeading*/}
        <Box flex={1} justifyContent="flex-end">
          <Pressable>
            <Text style={styles.subtext}>Terms and Conditions</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.subtext}>Privacy Policy</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.exittext}>Exit</Text>
          </Pressable>
        </Box>
      </View>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg,
    flex: 1,
    padding:16,
  },
  heading: {
    fontSize: 26,
    fontFamily: 'Nunito-900',
    marginTop: 30,
    marginBottom: 20,
  },
  text:{
    fontSize: 22,
    fontFamily: 'Nunito-800',
    marginLeft:8,
    
  },
  textContainer:{
    marginVertical: 12,
    alignItems:"center",
    //space: "sm",
  },
  icon:{
    color: theme.colors.cta,
    fontSize: 22,
  },
  subtext: {
    fontSize: 20,
    fontFamily: 'Nunito-700',
    marginBottom: 10,

  },
  exittext: {
    fontSize: 20,
    fontFamily: 'Nunito-900',
    marginBottom: 15,
    marginTop:15,

  },


})