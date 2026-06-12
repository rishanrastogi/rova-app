import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { RideProvider } from '../context/RideContext';
import { ThemeProvider } from '../context/ThemeContext';
import { RemindersProvider } from '../context/RemindersContext';
import { ReminderBanner } from '../components/ReminderBanner';
import { fontAssets } from '../constants/fonts';

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontAssets);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#0A0A0F' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
      <RideProvider>
      <RemindersProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <ReminderBanner />
      </RemindersProvider>
      </RideProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
