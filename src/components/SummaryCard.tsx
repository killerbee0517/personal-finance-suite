import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";
import { colors } from "@/constants/theme";

interface Props {
  label: string;
  value: string;
}

export const SummaryCard = ({ label, value }: Props) => (
  <Card style={styles.card}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </Card>
);

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: "48%" },
  label: { color: colors.textSecondary, fontSize: 12, marginBottom: 8 },
  value: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
});
