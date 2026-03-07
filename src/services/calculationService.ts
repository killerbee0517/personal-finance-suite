import dayjs from "dayjs";
import { DashboardMetrics, FD, FDLoanLink, Incentive, Loan } from "@/types/models";

export const pendingIncentive = (expected: number, received: number): number => Math.max(expected - received, 0);
export const spread = (fdRate: number, loanRate: number): number => fdRate - loanRate;
export const spreadIncome = (linkedAmount: number, spreadRate: number): number => (linkedAmount * spreadRate) / 100;
export const daysToMaturity = (maturityDate: string): number => dayjs(maturityDate).diff(dayjs(), "day");
export const daysToLoanClosure = (endDate: string): number => dayjs(endDate).diff(dayjs(), "day");

export const buildDashboardMetrics = (fds: FD[], loans: Loan[], links: FDLoanLink[], incentives: Incentive[]): DashboardMetrics => {
  const activeFds = fds.filter((f) => f.status === "active");
  const totalAssets = activeFds.reduce((sum, f) => sum + f.principal, 0);
  const totalLiabilities = loans.filter((l) => l.status === "active").reduce((sum, l) => sum + l.outstanding_principal, 0);
  const loanBackedDeposits = activeFds.filter((f) => f.funding_type?.toLowerCase().includes("loan") || f.linked_loan_id).reduce((s, f) => s + f.principal, 0);
  const reservedDeposits = activeFds.filter((f) => !!f.reserved_for).reduce((s, f) => s + f.principal, 0);
  const pendingIncentives = incentives.reduce((sum, i) => sum + i.pending_amount, 0);

  const loanById = new Map(loans.map((l) => [l.id, l]));
  const fdById = new Map(fds.map((f) => [f.id, f]));
  const estimatedSpreadIncome = links.reduce((sum, link) => {
    const fd = fdById.get(link.fd_id);
    const loan = loanById.get(link.loan_id);
    if (!fd || !loan) return sum;
    const s = spread(fd.interest_rate, loan.interest_rate);
    return sum + spreadIncome(link.linked_amount, s);
  }, 0);

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    investableWealth: totalAssets - totalLiabilities - loanBackedDeposits - reservedDeposits,
    activeFDValue: activeFds.reduce((sum, f) => sum + f.principal, 0),
    loanBackedDeposits,
    reservedDeposits,
    pendingIncentives,
    estimatedSpreadIncome,
  };
};
