import { useMemo, useState } from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import { Screen } from "@/components/Screen";
import { SummaryCard } from "@/components/SummaryCard";
import { Card } from "@/components/Card";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency } from "@/utils/format";
import dayjs from "dayjs";

type IncentiveFilter = "pending" | "partial" | "received" | "overdue";

export default function IncentiveScreen() {
  const incentives = useFinanceStore((s) => s.incentives);
  const [filter, setFilter] = useState<IncentiveFilter>("pending");
  const filtered = useMemo(() => incentives.filter((i) => i.status === filter), [incentives, filter]);

  const summary = useMemo(() => {
    const totalExpected = incentives.reduce((s, i) => s + i.expected_amount, 0);
    const totalReceived = incentives.reduce((s, i) => s + i.received_amount, 0);
    const totalPending = incentives.reduce((s, i) => s + i.pending_amount, 0);
    const overdueCount = incentives.filter((i) => i.pending_amount > 0 && dayjs(i.expected_date).isBefore(dayjs(), "day")).length;
    return { totalExpected, totalReceived, totalPending, overdueCount };
  }, [incentives]);

  return (
    <Screen>
      <Text style={styles.title}>Incentive Tracker</Text>
      <View style={styles.grid}>
        <SummaryCard label="Total Expected" value={formatCurrency(summary.totalExpected)} />
        <SummaryCard label="Total Received" value={formatCurrency(summary.totalReceived)} />
        <SummaryCard label="Total Pending" value={formatCurrency(summary.totalPending)} />
        <SummaryCard label="Overdue Count" value={`${summary.overdueCount}`} />
      </View>
      <View style={styles.tabs}>
        {(["pending", "partial", "received", "overdue"] as IncentiveFilter[]).map((f) => (
          <Pressable key={f} style={[styles.tab, filter === f && styles.tabActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>{f.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
      {filtered.map((incentive) => (
        <Card key={incentive.id} style={{ gap: 6 }}>
          <Text style={styles.bank}>{incentive.bank_name} ({incentive.incentive_type})</Text>
          <Text style={styles.info}>Expected: {formatCurrency(incentive.expected_amount)} | Received: {formatCurrency(incentive.received_amount)}</Text>
          <Text style={styles.info}>Pending: {formatCurrency(incentive.pending_amount)} | Expected date: {incentive.expected_date}</Text>
          <Text style={styles.info}>Delay days: {incentive.delay_days} | Linked FD: {incentive.fd_id}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tab: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#E6EEF2" },
  tabActive: { backgroundColor: "#0F766E" },
  tabText: { fontSize: 12, color: "#38515D" },
  tabTextActive: { color: "white" },
  bank: { fontWeight: "700" },
  info: { color: "#4D6671" },
});
