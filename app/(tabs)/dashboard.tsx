import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { SummaryCard } from "@/components/SummaryCard";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency } from "@/utils/format";
import { Card } from "@/components/Card";
import { BankExposureChart } from "@/components/charts/BankExposureChart";
import { daysToMaturity } from "@/services/calculationService";

export default function DashboardScreen() {
  const { metrics, fds, loans } = useFinanceStore((s) => ({ metrics: s.metrics, fds: s.fds, loans: s.loans }));
  const upcoming = fds.filter((fd) => daysToMaturity(fd.maturity_date) <= 30).slice(0, 4);
  const activeLoans = loans.filter((l) => l.status === "active");

  return (
    <Screen>
      <Text style={styles.title}>Personal Finance Mobile</Text>
      <View style={styles.grid}>
        <SummaryCard label="Total Assets" value={formatCurrency(metrics.totalAssets)} />
        <SummaryCard label="Total Liabilities" value={formatCurrency(metrics.totalLiabilities)} />
        <SummaryCard label="Net Worth" value={formatCurrency(metrics.netWorth)} />
        <SummaryCard label="Investable Wealth" value={formatCurrency(metrics.investableWealth)} />
      </View>
      <View style={styles.grid}>
        <SummaryCard label="Active FD Value" value={formatCurrency(metrics.activeFDValue)} />
        <SummaryCard label="Loan-Backed Deposits" value={formatCurrency(metrics.loanBackedDeposits)} />
        <SummaryCard label="Reserved Deposits" value={formatCurrency(metrics.reservedDeposits)} />
        <SummaryCard label="Pending Incentives" value={formatCurrency(metrics.pendingIncentives)} />
      </View>
      <SummaryCard label="Estimated Spread Income" value={formatCurrency(metrics.estimatedSpreadIncome)} />
      <BankExposureChart fds={fds.filter((f) => f.status === "active")} />
      <Card>
        <Text style={styles.sectionTitle}>Upcoming Maturities</Text>
        {upcoming.length === 0 ? <Text style={styles.muted}>No maturities in next 30 days.</Text> : upcoming.map((fd) => (
          <Text key={fd.id} style={styles.item}>{fd.bank_name} | {fd.fd_number} | {fd.maturity_date}</Text>
        ))}
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Liability Summary</Text>
        {activeLoans.map((loan) => <Text key={loan.id} style={styles.item}>{loan.bank_name} {loan.loan_type}: {formatCurrency(loan.outstanding_principal)}</Text>)}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: "#142028" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sectionTitle: { fontWeight: "700", marginBottom: 8 },
  muted: { color: "#4D6671" },
  item: { marginBottom: 6, color: "#142028" },
});
