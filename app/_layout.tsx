import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RideProvider } from '../context/RideContext';
import { ThemeProvider } from '../context/ThemeContext';
import { RemindersProvider } from '../context/RemindersContext';
import { ReminderBanner } from '../components/ReminderBanner';

export default function RootLayout() {
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
