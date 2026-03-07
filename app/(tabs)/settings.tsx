import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { useState } from "react";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useFinanceStore } from "@/store/useFinanceStore";

export default function SettingsScreen() {
  const resetAndSeed = useFinanceStore((s) => s.resetAndSeed);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [maturityThreshold, setMaturityThreshold] = useState(30);

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      <Card>
        <View style={styles.row}>
          <Text style={styles.label}>Local Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>
      </Card>
      <Card style={{ gap: 6 }}>
        <Text style={styles.label}>Alert Threshold</Text>
        <Text style={styles.text}>Maturity alert days: {maturityThreshold}</Text>
        <Text style={styles.sub}>Adjustable in next release</Text>
      </Card>
      <Card style={{ gap: 10 }}>
        <Text style={styles.label}>Seed / Reset Sample Data</Text>
        <PrimaryButton
          text="Reset with Sample Data"
          onPress={async () => {
            await resetAndSeed();
            Alert.alert("Done", "Sample data has been reloaded.");
          }}
        />
      </Card>
      <Card>
        <Text style={styles.label}>Backup / Export</Text>
        <Text style={styles.sub}>Google Sheets and export support planned for future update.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontWeight: "700", color: "#142028" },
  text: { color: "#142028" },
  sub: { color: "#4D6671" },
});
