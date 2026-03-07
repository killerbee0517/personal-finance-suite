import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const Badge = ({ text, tone = "default" }: { text: string; tone?: "default" | "warning" | "danger" }) => {
  return <View style={[styles.badge, tone === "warning" && styles.warning, tone === "danger" && styles.danger]}><Text style={[styles.text, tone === "danger" && styles.dangerText]}>{text}</Text></View>;
};

const styles = StyleSheet.create({
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, backgroundColor: "#D7F2EE", alignSelf: "flex-start" },
  warning: { backgroundColor: "#FFF3D6" },
  danger: { backgroundColor: "#FEE4E2" },
  text: { color: "#0F766E", fontSize: 11, fontWeight: "600" },
  dangerText: { color: "#B42318" },
});
