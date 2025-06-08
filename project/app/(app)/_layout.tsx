import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="Unit-Day" options={{ headerShown: false }} />
      <Stack.Screen name="Summon-Day" options={{ headerShown: false }} />
      <Stack.Screen name="Witch-Day" options={{ headerShown: false }} />
      <Stack.Screen name="Gear-Day" options={{ headerShown: false }} />
      <Stack.Screen name="Dragon-Day" options={{ headerShown: false }} />
      <Stack.Screen name="Hero-Day" options={{ headerShown: false }} />
      <Stack.Screen name="Ultimate-Power" options={{ headerShown: false }} />
      <Stack.Screen name="Ultimate-Hunting" options={{ headerShown: false }} />
      <Stack.Screen name="calculator" options={{ headerShown: false }} />
    </Stack>
  );
}