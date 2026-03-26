import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, Text, View } from '@gluestack-ui/themed';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../theme';

export default function CollectionsPlaceholderScreen() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />
      <View flex={1} bg={theme.colors.bg} px={24} justifyContent="center" alignItems="center">
        <Box
          width="100%"
          maxWidth={340}
          borderRadius={24}
          px={24}
          py={28}
          bg={theme.colors.paper}
          alignItems="center"
        >
          <MaterialCommunityIcons name="shape-outline" size={54} color={theme.colors.cta} />
          <Text
            mt={18}
            fontSize={28}
            color={theme.colors.text1}
            style={{ fontFamily: 'heading-900' }}
            textAlign="center"
          >
            Collections
          </Text>
          <Text
            mt={10}
            fontSize={18}
            color={theme.colors.text2}
            style={{ fontFamily: 'body-500' }}
            lineHeight={28}
            textAlign="center"
          >
            Curated recipe groups can live here.
          </Text>
          <Text
            mt={6}
            fontSize={16}
            color={theme.colors.text2}
            style={{ fontFamily: 'body-400' }}
            lineHeight={24}
            textAlign="center"
          >
            This is a placeholder tab so we can test the navigation layout first.
          </Text>
        </Box>
      </View>
    </SafeAreaView>
  );
}
