import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FD } from "@/types/models";
import { Card } from "../Card";
import { formatNumber } from "@/utils/format";

export const BankExposureChart = ({ fds }: { fds: FD[] }) => {
  const bankMap = new Map<string, number>();
  fds.forEach((fd) => bankMap.set(fd.bank_name, (bankMap.get(fd.bank_name) || 0) + fd.principal));
  const data = Array.from(bankMap.entries()).map(([label, value]) => ({
    label: label.slice(0, 10),
    value,
  }));
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <Text style={{ fontWeight: "700", marginBottom: 12 }}>Bank-wise FD exposure</Text>
      {data.length ? (
        <View style={styles.container}>
          {data.map((item) => (
            <View key={item.label} style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <View style={styles.barBg}>
                <View style={[styles.bar, { width: `${(item.value / max) * 100}%` }]} />
              </View>
              <Text style={styles.value}>{formatNumber(item.value)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View><Text>No FD data</Text></View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: { gap: 10 },
  row: { gap: 6 },
  label: { fontSize: 12, color: "#38515D" },
  barBg: { height: 10, borderRadius: 99, backgroundColor: "#E6EEF2", overflow: "hidden" },
  bar: { height: 10, backgroundColor: "#0F766E" },
  value: { fontSize: 12, color: "#4D6671" },
});
