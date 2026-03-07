import dayjs from "dayjs";
import { AlertItem, FD, FDLoanLink, Incentive, Loan } from "@/types/models";

export const generateAlerts = (fds: FD[], loans: Loan[], links: FDLoanLink[], incentives: Incentive[]): AlertItem[] => {
  const now = dayjs();
  const generated: AlertItem[] = [];

  fds.forEach((fd) => {
    const maturityDiff = dayjs(fd.maturity_date).diff(now, "day");
    if (maturityDiff <= 30) {
      generated.push({
        alert_type: fd.reserved_for ? "reserved_fd_maturing" : "fd_maturity_due",
        title: `${fd.bank_name} FD maturing`,
        message: `FD ${fd.fd_number} matures in ${maturityDiff} days`,
        related_entity_type: "fd",
        related_entity_id: fd.id || 0,
        due_date: fd.maturity_date,
        status: maturityDiff < 0 ? "overdue" : "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  loans.forEach((loan) => {
    const dueDiff = dayjs(loan.end_date).diff(now, "day");
    if (dueDiff <= 30) {
      generated.push({
        alert_type: "loan_due",
        title: `${loan.bank_name} loan due`,
        message: `Loan ${loan.account_number} closes in ${dueDiff} days`,
        related_entity_type: "loan",
        related_entity_id: loan.id || 0,
        due_date: loan.end_date,
        status: dueDiff < 0 ? "overdue" : "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  incentives.forEach((incentive) => {
    if (incentive.pending_amount > 0 && dayjs(incentive.expected_date).isBefore(now, "day")) {
      generated.push({
        alert_type: "incentive_overdue",
        title: `${incentive.bank_name} incentive overdue`,
        message: `Pending incentive: ${incentive.pending_amount.toFixed(0)}`,
        related_entity_type: "incentive",
        related_entity_id: incentive.id || 0,
        due_date: incentive.expected_date,
        status: "overdue",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  links.forEach((link) => {
    const fd = fds.find((f) => f.id === link.fd_id);
    const loan = loans.find((l) => l.id === link.loan_id);
    if (fd && loan && fd.interest_rate < loan.interest_rate) {
      generated.push({
        alert_type: "negative_spread",
        title: "Negative spread detected",
        message: `${fd.bank_name} FD (${fd.interest_rate}%) < ${loan.bank_name} loan (${loan.interest_rate}%)`,
        related_entity_type: "fd_loan_link",
        related_entity_id: link.id || 0,
        due_date: now.format("YYYY-MM-DD"),
        status: "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  return generated;
};
