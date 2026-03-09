export type FD = {
  id: number;
  instrument_type: string;
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
  maturity_value_actual: number | null;
  payout_type: string;
  status: string;
  funding_type: string;
  linked_loan_id: number | null;
  reserved_for: string | null;
  renewal_flag: number;
  renewal_from_fd_id: number | null;
  renewal_date: string | null;
  renewal_new_fd_amount: number | null;
  extra_amount_added: number | null;
  incentive_expected: number | null;
  incentive_received: number | null;
  certificate_received: number;
  certificate_received_date: string | null;
  raised_by_name: string | null;
  raised_by_contact: string | null;
  remarks: string | null;
  notes: string | null;
};

export type Loan = {
  id: number;
  loan_type: string;
  holder_name: string;
  bank_name: string;
  account_number: string;
  start_date: string;
  end_date: string;
  principal_amount: number;
  interest_rate: number;
  repayment_type: string;
  emi_amount: number | null;
  outstanding_principal: number;
  bullet_closure_amount: number | null;
  status: string;
  notes: string | null;
};

export type RD = {
  id: number;
  holder_name: string;
  bank_name: string;
  branch: string;
  rd_number: string;
  start_date: string;
  maturity_date: string;
  monthly_installment: number;
  total_installments: number;
  installments_paid: number;
  interest_rate: number;
  maturity_value_expected: number;
  maturity_value_actual: number | null;
  status: string;
  reserved_for: string | null;
  notes: string | null;
};

export type Bond = {
  id: number;
  platform: string;
  issuer_name: string;
  bond_name: string;
  isin: string;
  holder_name: string;
  investment_date: string;
  maturity_date: string;
  principal_invested: number;
  face_value: number;
  coupon_rate: number;
  payout_frequency: string;
  payout_day: number;
  units: number;
  status: string;
  notes: string | null;
};

export type BondCoupon = {
  id: number;
  bond_id: number;
  due_date: string;
  expected_amount: number;
  received_amount: number;
  status: string;
  received_date: string | null;
  notes: string | null;
};

export type EPFAccount = {
  id: number;
  employer_name: string;
  uan: string;
  member_id: string;
  current_balance: number;
  employee_monthly: number;
  employer_monthly: number;
  interest_rate: number;
  last_interest_credit_date: string;
  status: string;
  notes: string | null;
};

export type PPFAccount = {
  id: number;
  bank_name: string;
  account_number: string;
  holder_name: string;
  start_date: string;
  maturity_date: string;
  extension_years: number;
  current_balance: number;
  contribution_this_fy: number;
  target_contribution_fy: number;
  fy_deadline_date: string;
  last_contribution_date: string | null;
  status: string;
  notes: string | null;
};

export type InsurancePolicy = {
  id: number;
  policy_type: string;
  insurer_name: string;
  policy_number: string;
  holder_name: string;
  sum_assured: number;
  premium_amount: number;
  premium_frequency: string;
  next_due_date: string;
  grace_days: number;
  start_date: string;
  end_date: string | null;
  nominee_name: string | null;
  status: string;
  notes: string | null;
};

export type EquityHolding = {
  id: number;
  source: string;
  asset_type: string;
  folio_or_account: string | null;
  instrument_name: string;
  symbol: string | null;
  isin: string | null;
  quantity: number;
  average_cost: number;
  invested_value: number;
  current_value: number;
  valuation_date: string;
  notes: string | null;
};

export type EquityTransaction = {
  id: number;
  source: string;
  asset_type: string;
  instrument_name: string;
  symbol: string | null;
  isin: string | null;
  txn_type: string;
  txn_date: string;
  quantity: number;
  price: number;
  amount: number;
  folio_or_account: string | null;
  notes: string | null;
};

export type CasImportRun = {
  id: number;
  file_name: string;
  imported_at: string;
  records_count: number;
  notes: string | null;
};

export type Incentive = {
  id: number;
  fd_id: number;
  bank_name: string;
  rm_name: string | null;
  incentive_type: string;
  expected_amount: number;
  received_amount: number;
  pending_amount: number;
  expected_date: string;
  received_date: string | null;
  status: string;
  delay_days: number;
  notes: string | null;
};

export type FDLoanLink = {
  id: number;
  fd_id: number;
  loan_id: number;
  linked_amount: number;
  link_type: string;
  purpose: string | null;
  start_date: string;
  end_date: string | null;
  notes: string | null;
};

export type AlertItem = {
  id: number;
  alert_type: string;
  title: string;
  message: string;
  related_entity_type: string;
  related_entity_id: number;
  due_date: string;
  status: string;
  created_at: string;
};




