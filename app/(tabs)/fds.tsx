import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency } from "@/utils/format";
import { daysToMaturity } from "@/services/calculationService";

type Filter = "All" | "Active" | "Maturing Soon" | "Loan-Backed" | "Reserved";

export default function FDListScreen() {
  const fds = useFinanceStore((s) => s.fds);
  const [filter, setFilter] = useState<Filter>("All");
  const filtered = useMemo(() => {
    if (filter === "Active") return fds.filter((f) => f.status === "active");
    if (filter === "Maturing Soon") return fds.filter((f) => daysToMaturity(f.maturity_date) <= 30);
    if (filter === "Loan-Backed") return fds.filter((f) => f.funding_type?.toLowerCase().includes("loan") || !!f.linked_loan_id);
    if (filter === "Reserved") return fds.filter((f) => !!f.reserved_for);
    return fds;
  }, [fds, filter]);

  return (
    <Screen>
      <View style={styles.row}>
        <Text style={styles.title}>FD Tracker</Text>
        <Link href="/fd/form" asChild><Pressable><Text style={styles.add}>+ Add FD</Text></Pressable></Link>
      </View>
      <View style={styles.filters}>
        {(["All", "Active", "Maturing Soon", "Loan-Backed", "Reserved"] as Filter[]).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>
      {filtered.map((fd) => (
        <Link key={fd.id} href={`/fd/${fd.id}`} asChild>
          <Pressable>
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.bank}>{fd.bank_name}</Text>
                <Text style={styles.principal}>{formatCurrency(fd.principal)}</Text>
              </View>
              <Text style={styles.info}>Rate: {fd.interest_rate}% | Maturity: {fd.maturity_date} ({daysToMaturity(fd.maturity_date)} days)</Text>
              <Text style={styles.info}>Funding: {fd.funding_type || "Self"} | Linked Loan: {fd.linked_loan_id || "No"}</Text>
              <Text style={styles.info}>Pending Incentive: {formatCurrency((fd.incentive_expected || 0) - (fd.incentive_received || 0))}</Text>
              <View style={styles.row}>
                {(fd.funding_type?.toLowerCase().includes("loan") || fd.linked_loan_id) && <Badge text="Loan-Backed" tone="warning" />}
                {!!fd.reserved_for && <Badge text="Reserved" tone="danger" />}
              </View>
            </Card>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  add: { color: "#0F766E", fontWeight: "700" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#E6EEF2" },
  filterChipActive: { backgroundColor: "#0F766E" },
  filterText: { color: "#38515D", fontSize: 12 },
  filterTextActive: { color: "white" },
  card: { gap: 8 },
  bank: { fontSize: 16, fontWeight: "700" },
  principal: { fontWeight: "700" },
  info: { color: "#4D6671" },
});
