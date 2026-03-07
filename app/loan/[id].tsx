import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency } from "@/utils/format";
import { spread, spreadIncome } from "@/services/calculationService";

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loans, links, fds } = useFinanceStore((s) => ({ loans: s.loans, links: s.links, fds: s.fds }));
  const loan = loans.find((item) => item.id === Number(id));
  if (!loan) return <Screen><Text>Loan not found.</Text></Screen>;

  const loanLinks = links.filter((l) => l.loan_id === loan.id);
  const totalLinkedAmount = loanLinks.reduce((sum, l) => sum + l.linked_amount, 0);

  const weightedSpread = loanLinks.reduce((acc, link) => {
    const fd = fds.find((f) => f.id === link.fd_id);
    if (!fd || totalLinkedAmount === 0) return acc;
    const s = spread(fd.interest_rate, loan.interest_rate);
    return acc + (s * link.linked_amount) / totalLinkedAmount;
  }, 0);

  const spreadIncomeTotal = loanLinks.reduce((acc, link) => {
    const fd = fds.find((f) => f.id === link.fd_id);
    if (!fd) return acc;
    return acc + spreadIncome(link.linked_amount, spread(fd.interest_rate, loan.interest_rate));
  }, 0);

  return (
    <Screen>
      <Card style={{ gap: 8 }}>
        <Text style={styles.title}>{loan.bank_name} | {loan.loan_type}</Text>
        <Text>Outstanding: {formatCurrency(loan.outstanding_principal)}</Text>
        <Text>Rate: {loan.interest_rate}% | Due: {loan.end_date}</Text>
        <Text>Repayment: {loan.repayment_type} | EMI: {formatCurrency(loan.emi_amount || 0)}</Text>
      </Card>
      <Card style={{ gap: 6 }}>
        <Text style={styles.heading}>Linked FDs</Text>
        {loanLinks.length === 0 ? <Text>No linked FDs.</Text> : loanLinks.map((link) => {
          const fd = fds.find((f) => f.id === link.fd_id);
          return <Text key={link.id}>{fd?.bank_name || "FD"} #{fd?.fd_number} | {formatCurrency(link.linked_amount)}</Text>;
        })}
        <Text>Total linked amount: {formatCurrency(totalLinkedAmount)}</Text>
        <Text>Weighted spread: {weightedSpread.toFixed(2)}%</Text>
        <Text>Spread income: {formatCurrency(spreadIncomeTotal)}</Text>
      </Card>
      <Link href={{ pathname: "/loan/form", params: { id } }} asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Edit Loan</Text></Pressable>
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
