import '@/i18n'; // ← Already there - good!
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, MedievalSharp_400Regular } from '@expo-google-fonts/medievalsharp';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SplashScreen } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import Background from '@/components/Background';
import SlidingNav from '@/components/SlidingNav';

// Prevent splash screen from auto-hiding before assets are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    MedievalSharp: MedievalSharp_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded or if there's an error
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Keep splash screen visible while fonts are still loading
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Background>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
            </Stack>
            <StatusBar style="light" />
            <SlidingNav />
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Background>
  );
}