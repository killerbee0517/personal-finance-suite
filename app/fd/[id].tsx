import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency } from "@/utils/format";
import { spread, spreadIncome } from "@/services/calculationService";

export default function FDDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fds, loans, links } = useFinanceStore((s) => ({ fds: s.fds, loans: s.loans, links: s.links }));
  const fd = fds.find((item) => item.id === Number(id));
  if (!fd) return <Screen><Text>FD not found.</Text></Screen>;

  const linked = links.find((l) => l.fd_id === fd.id);
  const loan = linked ? loans.find((l) => l.id === linked.loan_id) : undefined;
  const spreadRate = loan ? spread(fd.interest_rate, loan.interest_rate) : 0;
  const spreadAmt = linked ? spreadIncome(linked.linked_amount, spreadRate) : 0;
  const pending = (fd.incentive_expected || 0) - (fd.incentive_received || 0);

  return (
    <Screen>
      <Card style={{ gap: 8 }}>
        <Text style={styles.title}>{fd.bank_name} | {fd.fd_number}</Text>
        {(fd.funding_type?.toLowerCase().includes("loan") || fd.linked_loan_id) && <Badge text="Loan-Backed" tone="warning" />}
        {!!fd.reserved_for && <Badge text={`Reserved: ${fd.reserved_for}`} tone="danger" />}
        <Text>Principal: {formatCurrency(fd.principal)}</Text>
        <Text>Rate: {fd.interest_rate}% | Maturity: {fd.maturity_date}</Text>
        <Text>Status: {fd.status} | Payout: {fd.payout_type}</Text>
      </Card>

      <Card style={{ gap: 6 }}>
        <Text style={styles.heading}>Maturity Summary</Text>
        <Text>Expected: {formatCurrency(fd.maturity_value_expected)}</Text>
        <Text>Actual: {formatCurrency(fd.maturity_value_actual || 0)}</Text>
      </Card>

      <Card style={{ gap: 6 }}>
        <Text style={styles.heading}>Incentive Summary</Text>
        <Text>Expected: {formatCurrency(fd.incentive_expected || 0)}</Text>
        <Text>Received: {formatCurrency(fd.incentive_received || 0)}</Text>
        <Text>Pending: {formatCurrency(pending)}</Text>
      </Card>

      <Card style={{ gap: 6 }}>
        <Text style={styles.heading}>Linked Loan Summary</Text>
        {!loan || !linked ? <Text>No linked loan.</Text> : (
          <>
            <Text>{loan.bank_name} ({loan.loan_type})</Text>
            <Text>Linked amount: {formatCurrency(linked.linked_amount)}</Text>
            <Text>Loan rate: {loan.interest_rate}% | FD rate: {fd.interest_rate}%</Text>
            <Text>Spread: {spreadRate.toFixed(2)}%</Text>
            <Text>Spread Income: {formatCurrency(spreadAmt)}</Text>
          </>
        )}
      </Card>

      <Link href={{ pathname: "/fd/form", params: { id } }} asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Edit FD</Text></Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "800" },
  heading: { fontWeight: "700" },
  button: { backgroundColor: "#0F766E", borderRadius: 12, padding: 12, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700" },
});
