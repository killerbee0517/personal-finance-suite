import { StyleSheet, Text } from "react-native";
import dayjs from "dayjs";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { useFinanceStore } from "@/store/useFinanceStore";

const inDays = (date: string, n: number) => {
  const diff = dayjs(date).diff(dayjs(), "day");
  return diff >= 0 && diff <= n;
};

export default function AlertsScreen() {
  const alerts = useFinanceStore((s) => s.alerts);
  const groups = {
    Today: alerts.filter((a) => dayjs(a.due_date).isSame(dayjs(), "day")),
    "Next 7 days": alerts.filter((a) => inDays(a.due_date, 7)),
    "Next 30 days": alerts.filter((a) => inDays(a.due_date, 30)),
    Overdue: alerts.filter((a) => dayjs(a.due_date).isBefore(dayjs(), "day") || a.status === "overdue"),
  };

  return (
    <Screen>
      <Text style={styles.title}>Alerts Center</Text>
      {Object.entries(groups).map(([label, list]) => (
        <Card key={label} style={{ gap: 8 }}>
          <Text style={styles.heading}>{label}</Text>
          {list.length === 0 ? <Text style={styles.muted}>No alerts</Text> : list.map((alert) => (
            <Text key={alert.id} style={styles.item}>[{alert.alert_type}] {alert.title} - {alert.due_date}</Text>
          ))}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800" },
  heading: { fontWeight: "700" },
  muted: { color: "#4D6671" },
  item: { color: "#142028" },
});
