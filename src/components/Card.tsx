import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "@/constants/theme";

export const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6EEF2",
  },
});
