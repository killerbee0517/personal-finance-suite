import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useInitializeApp } from "@/hooks/useInitializeApp";

export default function RootLayout() {
  const { ready } = useInitializeApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="fd/form" options={{ title: "FD Form" }} />
      <Stack.Screen name="fd/[id]" options={{ title: "FD Details" }} />
      <Stack.Screen name="loan/form" options={{ title: "Loan Form" }} />
      <Stack.Screen name="loan/[id]" options={{ title: "Loan Details" }} />
    </Stack>
  );
}
