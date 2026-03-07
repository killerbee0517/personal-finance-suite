import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/constants/theme";

export const PrimaryButton = ({ text, onPress }: { text: string; onPress: () => void }) => (
  <Pressable style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{text}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: { backgroundColor: colors.teal, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  text: { color: "white", fontWeight: "700", fontSize: 15 },
});
