import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/studentLogin" />
      <Stack.Screen name="(auth)/studentRegister" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}