import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, ScrollView, Text, View } from '@gluestack-ui/themed';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecipeBar } from '../../components/RecipeBar';
import { useRecipeStore } from '../../stores/useRecipeStore';
import theme from '../../theme';


export default function Menu() {

  const recipes = useRecipeStore((state) => state.recipes);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        
        {/*Headings*/}
        <Text style={styles.heading}>Menu</Text>
        
        <ScrollView>
          <Box>
            <Pressable>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons name="lock-open-outline" style={styles.icon} />
                <Text style={styles.text}>Upgrade to Pro</Text>
              </HStack>
              <Text style={styles.undertext}>Upgrade to unlock unlimited recipe storage</Text>
              <Text style={styles.undertext}>{recipes.length} of 10 recipes stored</Text>
              {/*<RecipeBar />*/}
              <Box style={styles.recipebar}>
                <RecipeBar />
              </Box>
            </Pressable>
            
            <Pressable>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons name="map-marker-path" style={styles.icon} />
                <Text style={styles.text}>Quick Tour</Text>
              </HStack>
              <Text style={styles.undertext}>Take a tour of the app</Text>
            </Pressable>
          
            <Pressable>
              <HStack style={styles.textContainer}>
                <MaterialCommunityIcons name="star-outline" style={styles.icon} />
                <Text style={styles.text}>Rate</Text>
              </HStack>
              <Text style={styles.undertext}>Let others know what you think</Text>
            </Pressable>
            <Pressable>
              <HStack style={styles.textContainer}>
                <Feather name="share-2" style={styles.icon} />
                <Text style={styles.text}>Share</Text>
              </HStack>
              <Text style={styles.undertext}>Share with your friends and family</Text>
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
              <Text style={styles.undertext}>Leave feedback or get in touch for support</Text>
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
          <Box flex={1}>
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
        </ScrollView>
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
  undertext:{
    fontSize: 18,
    fontFamily: 'Nunito-400',
    color: theme.colors.text2,
    marginLeft:32,
  },
  recipebar:{
    marginLeft:32,
    marginTop:6,
  },
  textContainer:{
    marginTop: 12,
    marginBottom: 2,
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