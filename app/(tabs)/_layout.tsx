import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#0F766E" }}>
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="fds" options={{ title: "FDs", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="bank-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="loans" options={{ title: "Loans", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="hand-coin-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="incentives" options={{ title: "Incentives", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="gift-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="alerts" options={{ title: "Alerts", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="bell-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
