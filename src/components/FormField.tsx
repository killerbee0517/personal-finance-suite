import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/constants/theme";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  error?: string;
}

export const FormField = ({ label, value, onChangeText, placeholder, keyboardType = "default", error }: FormFieldProps) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error ? styles.errorInput : null]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      placeholderTextColor="#8CA0AB"
    />
    {!!error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { color: colors.textSecondary, fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
  errorInput: { borderColor: colors.rose },
  error: { color: colors.rose, fontSize: 12 },
});
