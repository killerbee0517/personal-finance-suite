import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency } from "@/utils/format";
import { daysToLoanClosure } from "@/services/calculationService";

export default function LoanListScreen() {
  const { loans, links } = useFinanceStore((s) => ({ loans: s.loans, links: s.links }));
  const [filter, setFilter] = useState<"active" | "dueSoon">("active");
  const filtered = useMemo(() => {
    if (filter === "active") return loans.filter((l) => l.status === "active");
    return loans.filter((l) => daysToLoanClosure(l.end_date) <= 60);
  }, [loans, filter]);

  return (
    <Screen>
      <View style={styles.row}>
        <Text style={styles.title}>Loan Tracker</Text>
        <Link href="/loan/form" asChild><Pressable><Text style={styles.add}>+ Add Loan</Text></Pressable></Link>
      </View>
      <View style={styles.filters}>
        <Pressable onPress={() => setFilter("active")} style={[styles.filter, filter === "active" && styles.active]}><Text style={[styles.ft, filter === "active" && styles.fta]}>Active</Text></Pressable>
        <Pressable onPress={() => setFilter("dueSoon")} style={[styles.filter, filter === "dueSoon" && styles.active]}><Text style={[styles.ft, filter === "dueSoon" && styles.fta]}>Due Soon</Text></Pressable>
      </View>
      {filtered.map((loan) => {
        const linkedCount = links.filter((l) => l.loan_id === loan.id).length;
        return (
          <Link key={loan.id} href={`/loan/${loan.id}`} asChild>
            <Pressable>
              <Card style={{ gap: 6 }}>
                <Text style={styles.bank}>{loan.bank_name} | {loan.loan_type}</Text>
                <Text style={styles.info}>Outstanding: {formatCurrency(loan.outstanding_principal)}</Text>
                <Text style={styles.info}>Rate: {loan.interest_rate}% | Due: {loan.end_date} ({daysToLoanClosure(loan.end_date)} days)</Text>
                <Text style={styles.info}>Linked FD count: {linkedCount}</Text>
              </Card>
            </Pressable>
          </Link>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800" },
  add: { color: "#0F766E", fontWeight: "700" },
  filters: { flexDirection: "row", gap: 10 },
  filter: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#E6EEF2" },
  active: { backgroundColor: "#0F766E" },
  ft: { color: "#38515D" },
  fta: { color: "white" },
  bank: { fontWeight: "700" },
  info: { color: "#4D6671" },
});
