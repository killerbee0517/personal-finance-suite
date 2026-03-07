export type EntityStatus = "active" | "closed" | "matured" | "partial" | "pending" | "received" | "overdue";

export interface FD {
  id?: number;
  holder_name: string;
  bank_name: string;
  branch: string;
  fd_number: string;
  deposit_date: string;
  maturity_date: string;
  principal: number;
  interest_rate: number;
  tenure_days: number;
  maturity_value_expected: number;
  maturity_value_actual?: number | null;
  payout_type: string;
  status: string;
  funding_type: string;
  linked_loan_id?: number | null;
  reserved_for?: string | null;
  renewal_flag: number;
  renewal_date?: string | null;
  renewal_new_fd_amount?: number | null;
  extra_amount_added?: number | null;
  incentive_expected?: number | null;
  incentive_received?: number | null;
  notes?: string | null;
}

export interface Loan {
  id?: number;
  loan_type: string;
  holder_name: string;
  bank_name: string;
  account_number: string;
  start_date: string;
  end_date: string;
  principal_amount: number;
  interest_rate: number;
  repayment_type: string;
  emi_amount?: number | null;
  outstanding_principal: number;
  bullet_closure_amount?: number | null;
  status: string;
  notes?: string | null;
}

export interface FDLoanLink {
  id?: number;
  fd_id: number;
  loan_id: number;
  linked_amount: number;
  link_type: string;
  purpose?: string | null;
  start_date: string;
  end_date?: string | null;
  notes?: string | null;
}

export interface Incentive {
  id?: number;
  fd_id: number;
  bank_name: string;
  rm_name?: string | null;
  incentive_type: string;
  expected_amount: number;
  received_amount: number;
  pending_amount: number;
  expected_date: string;
  received_date?: string | null;
  status: string;
  delay_days: number;
  notes?: string | null;
}

export interface AlertItem {
  id?: number;
  alert_type: string;
  title: string;
  message: string;
  related_entity_type: string;
  related_entity_id: number;
  due_date: string;
  status: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  investableWealth: number;
  activeFDValue: number;
  loanBackedDeposits: number;
  reservedDeposits: number;
  pendingIncentives: number;
  estimatedSpreadIncome: number;
}
