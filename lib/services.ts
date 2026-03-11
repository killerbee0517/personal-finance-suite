import dayjs from "dayjs";
import { sql } from "@/lib/db";
import {
  AlertItem,
  Bond,
  BondCoupon,
  CasImportRun,
  EPFAccount,
  EquityHolding,
  EquityTransaction,
  FD,
  FDLoanLink,
  InsurancePolicy,
  Incentive,
  Loan,
  PhysicalAsset,
  PPFAccount,
  RD,
} from "@/lib/models";

const dateCols = [
  "deposit_date",
  "certificate_received_date",
  "maturity_date",
  "renewal_date",
  "start_date",
  "end_date",
  "expected_date",
  "received_date",
  "due_date",
  "created_at",
  "investment_date",
  "valuation_date",
  "txn_date",
  "imported_at",
  "next_due_date",
  "fy_deadline_date",
  "last_interest_credit_date",
  "last_contribution_date",
  "purchase_date",
];

const normalize = <T extends Record<string, unknown>>(row: T): T => {
  const out = { ...row } as Record<string, unknown>;
  dateCols.forEach((k) => {
    if (out[k] instanceof Date) out[k] = dayjs(out[k] as Date).format("YYYY-MM-DD");
  });
  return out as T;
};

export const repo = {
  listFDs: async () => (await sql<FD>("SELECT * FROM fd_master ORDER BY maturity_date ASC")).map(normalize),
  getFD: async (id: number) => {
    const rows = await sql<FD>("SELECT * FROM fd_master WHERE id=?", [id]);
    return rows[0] ? normalize(rows[0]) : undefined;
  },
  saveFD: async (payload: Omit<FD, "id">, id?: number) => {
    if (id) {
      await sql(
        `UPDATE fd_master SET instrument_type=?,institution_type=?,holder_name=?,bank_name=?,branch=?,fd_number=?,deposit_date=?,maturity_date=?,principal=?,interest_rate=?,tenure_days=?,maturity_value_expected=?,maturity_value_actual=?,payout_type=?,status=?,funding_type=?,linked_loan_id=?,reserved_for=?,renewal_flag=?,renewal_from_fd_id=?,renewal_date=?,renewal_new_fd_amount=?,extra_amount_added=?,incentive_expected=?,incentive_received=?,incentive_percentage=?,certificate_received=?,certificate_received_date=?,is_joint_account=?,payment_mode=?,raised_by_name=?,raised_by_contact=?,raised_under_name=?,nominee_name=?,remarks=?,notes=? WHERE id=?`,
        [
          payload.instrument_type,
          payload.institution_type,
          payload.holder_name,
          payload.bank_name,
          payload.branch,
          payload.fd_number,
          payload.deposit_date,
          payload.maturity_date,
          payload.principal,
          payload.interest_rate,
          payload.tenure_days,
          payload.maturity_value_expected,
          payload.maturity_value_actual,
          payload.payout_type,
          payload.status,
          payload.funding_type,
          payload.linked_loan_id,
          payload.reserved_for,
          payload.renewal_flag,
          payload.renewal_from_fd_id,
          payload.renewal_date,
          payload.renewal_new_fd_amount,
          payload.extra_amount_added,
          payload.incentive_expected,
          payload.incentive_received,
          payload.incentive_percentage,
          payload.certificate_received,
          payload.certificate_received_date,
          payload.is_joint_account,
          payload.payment_mode,
          payload.raised_by_name,
          payload.raised_by_contact,
          payload.raised_under_name,
          payload.nominee_name,
          payload.remarks,
          payload.notes,
          id,
        ],
      );
      return;
    }
    await sql(
      `INSERT INTO fd_master (instrument_type,institution_type,holder_name,bank_name,branch,fd_number,deposit_date,maturity_date,principal,interest_rate,tenure_days,maturity_value_expected,maturity_value_actual,payout_type,status,funding_type,linked_loan_id,reserved_for,renewal_flag,renewal_from_fd_id,renewal_date,renewal_new_fd_amount,extra_amount_added,incentive_expected,incentive_received,incentive_percentage,certificate_received,certificate_received_date,is_joint_account,payment_mode,raised_by_name,raised_by_contact,raised_under_name,nominee_name,remarks,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        payload.instrument_type,
        payload.institution_type,
        payload.holder_name,
        payload.bank_name,
        payload.branch,
        payload.fd_number,
        payload.deposit_date,
        payload.maturity_date,
        payload.principal,
        payload.interest_rate,
        payload.tenure_days,
        payload.maturity_value_expected,
        payload.maturity_value_actual,
        payload.payout_type,
        payload.status,
        payload.funding_type,
        payload.linked_loan_id,
        payload.reserved_for,
        payload.renewal_flag,
        payload.renewal_from_fd_id,
        payload.renewal_date,
        payload.renewal_new_fd_amount,
        payload.extra_amount_added,
        payload.incentive_expected,
        payload.incentive_received,
        payload.incentive_percentage,
        payload.certificate_received,
        payload.certificate_received_date,
        payload.is_joint_account,
        payload.payment_mode,
        payload.raised_by_name,
        payload.raised_by_contact,
        payload.raised_under_name,
        payload.nominee_name,
        payload.remarks,
        payload.notes,
      ],
    );
  },

  listLoans: async () => (await sql<Loan>("SELECT * FROM loan_master ORDER BY end_date ASC")).map(normalize),
  getLoan: async (id: number) => {
    const rows = await sql<Loan>("SELECT * FROM loan_master WHERE id=?", [id]);
    return rows[0] ? normalize(rows[0]) : undefined;
  },
  saveLoan: async (payload: Omit<Loan, "id">, id?: number) => {
    if (id) {
      await sql(
        `UPDATE loan_master SET loan_type=?,holder_name=?,bank_name=?,account_number=?,start_date=?,end_date=?,principal_amount=?,interest_rate=?,repayment_type=?,emi_amount=?,outstanding_principal=?,bullet_closure_amount=?,status=?,notes=? WHERE id=?`,
        [
          payload.loan_type,
          payload.holder_name,
          payload.bank_name,
          payload.account_number,
          payload.start_date,
          payload.end_date,
          payload.principal_amount,
          payload.interest_rate,
          payload.repayment_type,
          payload.emi_amount,
          payload.outstanding_principal,
          payload.bullet_closure_amount,
          payload.status,
          payload.notes,
          id,
        ],
      );
      return;
    }
    await sql(
      `INSERT INTO loan_master (loan_type,holder_name,bank_name,account_number,start_date,end_date,principal_amount,interest_rate,repayment_type,emi_amount,outstanding_principal,bullet_closure_amount,status,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        payload.loan_type,
        payload.holder_name,
        payload.bank_name,
        payload.account_number,
        payload.start_date,
        payload.end_date,
        payload.principal_amount,
        payload.interest_rate,
        payload.repayment_type,
        payload.emi_amount,
        payload.outstanding_principal,
        payload.bullet_closure_amount,
        payload.status,
        payload.notes,
      ],
    );
  },

  listRDs: async () => (await sql<RD>("SELECT * FROM rd_master ORDER BY maturity_date ASC")).map(normalize),
  getRD: async (id: number) => {
    const rows = await sql<RD>("SELECT * FROM rd_master WHERE id=?", [id]);
    return rows[0] ? normalize(rows[0]) : undefined;
  },
  saveRD: async (payload: Omit<RD, "id">, id?: number) => {
    if (id) {
      await sql(
        `UPDATE rd_master SET holder_name=?,bank_name=?,branch=?,rd_number=?,start_date=?,maturity_date=?,monthly_installment=?,total_installments=?,installments_paid=?,interest_rate=?,maturity_value_expected=?,maturity_value_actual=?,status=?,reserved_for=?,notes=? WHERE id=?`,
        [
          payload.holder_name,
          payload.bank_name,
          payload.branch,
          payload.rd_number,
          payload.start_date,
          payload.maturity_date,
          payload.monthly_installment,
          payload.total_installments,
          payload.installments_paid,
          payload.interest_rate,
          payload.maturity_value_expected,
          payload.maturity_value_actual,
          payload.status,
          payload.reserved_for,
          payload.notes,
          id,
        ],
      );
      return;
    }
    await sql(
      `INSERT INTO rd_master (holder_name,bank_name,branch,rd_number,start_date,maturity_date,monthly_installment,total_installments,installments_paid,interest_rate,maturity_value_expected,maturity_value_actual,status,reserved_for,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        payload.holder_name,
        payload.bank_name,
        payload.branch,
        payload.rd_number,
        payload.start_date,
        payload.maturity_date,
        payload.monthly_installment,
        payload.total_installments,
        payload.installments_paid,
        payload.interest_rate,
        payload.maturity_value_expected,
        payload.maturity_value_actual,
        payload.status,
        payload.reserved_for,
        payload.notes,
      ],
    );
  },

  listBonds: async () => (await sql<Bond>("SELECT * FROM bond_master ORDER BY maturity_date ASC")).map(normalize),
  getBond: async (id: number) => {
    const rows = await sql<Bond>("SELECT * FROM bond_master WHERE id=?", [id]);
    return rows[0] ? normalize(rows[0]) : undefined;
  },
  saveBond: async (payload: Omit<Bond, "id">, id?: number) => {
    if (id) {
      await sql(
        `UPDATE bond_master SET platform=?,issuer_name=?,bond_name=?,isin=?,holder_name=?,investment_date=?,maturity_date=?,principal_invested=?,face_value=?,coupon_rate=?,payout_frequency=?,payout_day=?,units=?,status=?,notes=? WHERE id=?`,
        [
          payload.platform,
          payload.issuer_name,
          payload.bond_name,
          payload.isin,
          payload.holder_name,
          payload.investment_date,
          payload.maturity_date,
          payload.principal_invested,
          payload.face_value,
          payload.coupon_rate,
          payload.payout_frequency,
          payload.payout_day,
          payload.units,
          payload.status,
          payload.notes,
          id,
        ],
      );
      return;
    }
    await sql(
      `INSERT INTO bond_master (platform,issuer_name,bond_name,isin,holder_name,investment_date,maturity_date,principal_invested,face_value,coupon_rate,payout_frequency,payout_day,units,status,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        payload.platform,
        payload.issuer_name,
        payload.bond_name,
        payload.isin,
        payload.holder_name,
        payload.investment_date,
        payload.maturity_date,
        payload.principal_invested,
        payload.face_value,
        payload.coupon_rate,
        payload.payout_frequency,
        payload.payout_day,
        payload.units,
        payload.status,
        payload.notes,
      ],
    );
  },

  listBondCoupons: async () => (await sql<BondCoupon>("SELECT * FROM bond_coupon_schedule ORDER BY due_date ASC")).map(normalize),
  listBondCouponsByBond: async (bondId: number) =>
    (await sql<BondCoupon>("SELECT * FROM bond_coupon_schedule WHERE bond_id=? ORDER BY due_date ASC", [bondId])).map(normalize),
  saveBondCoupons: async (bondId: number, coupons: Array<Omit<BondCoupon, "id" | "bond_id">>) => {
    await sql("DELETE FROM bond_coupon_schedule WHERE bond_id=?", [bondId]);
    for (const c of coupons) {
      await sql(
        `INSERT INTO bond_coupon_schedule (bond_id,due_date,expected_amount,received_amount,status,received_date,notes) VALUES (?,?,?,?,?,?,?)`,
        [bondId, c.due_date, c.expected_amount, c.received_amount, c.status, c.received_date, c.notes],
      );
    }
  },

  listEPFAccounts: async () => (await sql<EPFAccount>("SELECT * FROM epf_accounts ORDER BY employer_name ASC")).map(normalize),
  getEPFAccount: async (id: number) => {
    const rows = await sql<EPFAccount>("SELECT * FROM epf_accounts WHERE id=?", [id]);
    return rows[0] ? normalize(rows[0]) : undefined;
  },
  saveEPFAccount: async (payload: Omit<EPFAccount, "id">, id?: number) => {
    if (id) {
      await sql(
        `UPDATE epf_accounts SET employer_name=?,uan=?,member_id=?,current_balance=?,employee_monthly=?,employer_monthly=?,interest_rate=?,last_interest_credit_date=?,status=?,notes=? WHERE id=?`,
        [
          payload.employer_name,
          payload.uan,
          payload.member_id,
          payload.current_balance,
          payload.employee_monthly,
          payload.employer_monthly,
          payload.interest_rate,
          payload.last_interest_credit_date,
          payload.status,
          payload.notes,
          id,
        ],
      );
      return;
    }
    await sql(
      `INSERT INTO epf_accounts (employer_name,uan,member_id,current_balance,employee_monthly,employer_monthly,interest_rate,last_interest_credit_date,status,notes) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        payload.employer_name,
        payload.uan,
        payload.member_id,
        payload.current_balance,
        payload.employee_monthly,
        payload.employer_monthly,
        payload.interest_rate,
        payload.last_interest_credit_date,
        payload.status,
        payload.notes,
      ],
    );
  },

  listPPFAccounts: async () => (await sql<PPFAccount>("SELECT * FROM ppf_accounts ORDER BY maturity_date ASC")).map(normalize),
  getPPFAccount: async (id: number) => {
    const rows = await sql<PPFAccount>("SELECT * FROM ppf_accounts WHERE id=?", [id]);
    return rows[0] ? normalize(rows[0]) : undefined;
  },
  savePPFAccount: async (payload: Omit<PPFAccount, "id">, id?: number) => {
    if (id) {
      await sql(
        `UPDATE ppf_accounts SET bank_name=?,account_number=?,holder_name=?,start_date=?,maturity_date=?,extension_years=?,current_balance=?,contribution_this_fy=?,target_contribution_fy=?,fy_deadline_date=?,last_contribution_date=?,status=?,notes=? WHERE id=?`,
        [
          payload.bank_name,
          payload.account_number,
          payload.holder_name,
          payload.start_date,
          payload.maturity_date,
          payload.extension_years,
          payload.current_balance,
          payload.contribution_this_fy,
          payload.target_contribution_fy,
          payload.fy_deadline_date,
          payload.last_contribution_date,
          payload.status,
          payload.notes,
          id,
        ],
      );
      return;
    }
    await sql(
      `INSERT INTO ppf_accounts (bank_name,account_number,holder_name,start_date,maturity_date,extension_years,current_balance,contribution_this_fy,target_contribution_fy,fy_deadline_date,last_contribution_date,status,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        payload.bank_name,
        payload.account_number,
        payload.holder_name,
        payload.start_date,
        payload.maturity_date,
        payload.extension_years,
        payload.current_balance,
        payload.contribution_this_fy,
        payload.target_contribution_fy,
        payload.fy_deadline_date,
        payload.last_contribution_date,
        payload.status,
        payload.notes,
      ],
    );
  },

  listInsurancePolicies: async () =>
    (await sql<InsurancePolicy>("SELECT * FROM insurance_policies ORDER BY next_due_date ASC")).map(normalize),
  getInsurancePolicy: async (id: number) => {
    const rows = await sql<InsurancePolicy>("SELECT * FROM insurance_policies WHERE id=?", [id]);
    return rows[0] ? normalize(rows[0]) : undefined;
  },
  saveInsurancePolicy: async (payload: Omit<InsurancePolicy, "id">, id?: number) => {
    if (id) {
      await sql(
        `UPDATE insurance_policies SET policy_type=?,insurer_name=?,policy_number=?,holder_name=?,sum_assured=?,premium_amount=?,premium_frequency=?,next_due_date=?,grace_days=?,start_date=?,end_date=?,nominee_name=?,status=?,notes=? WHERE id=?`,
        [
          payload.policy_type,
          payload.insurer_name,
          payload.policy_number,
          payload.holder_name,
          payload.sum_assured,
          payload.premium_amount,
          payload.premium_frequency,
          payload.next_due_date,
          payload.grace_days,
          payload.start_date,
          payload.end_date,
          payload.nominee_name,
          payload.status,
          payload.notes,
          id,
        ],
      );
      return;
    }
    await sql(
      `INSERT INTO insurance_policies (policy_type,insurer_name,policy_number,holder_name,sum_assured,premium_amount,premium_frequency,next_due_date,grace_days,start_date,end_date,nominee_name,status,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        payload.policy_type,
        payload.insurer_name,
        payload.policy_number,
        payload.holder_name,
        payload.sum_assured,
        payload.premium_amount,
        payload.premium_frequency,
        payload.next_due_date,
        payload.grace_days,
        payload.start_date,
        payload.end_date,
        payload.nominee_name,
        payload.status,
        payload.notes,
      ],
    );
  },

  listPhysicalAssets: async () =>
    (await sql<PhysicalAsset>("SELECT * FROM physical_assets ORDER BY purchase_date DESC")).map(normalize),
  getPhysicalAsset: async (id: number) => {
    const rows = await sql<PhysicalAsset>("SELECT * FROM physical_assets WHERE id=?", [id]);
    return rows[0] ? normalize(rows[0]) : undefined;
  },
  savePhysicalAsset: async (payload: Omit<PhysicalAsset, "id">, id?: number) => {
    if (id) {
      await sql(
        `UPDATE physical_assets SET asset_type=?,asset_name=?,holder_name=?,quantity=?,unit=?,purchase_date=?,purchase_rate=?,current_rate=?,purchase_value=?,current_value=?,status=?,notes=? WHERE id=?`,
        [
          payload.asset_type,
          payload.asset_name,
          payload.holder_name,
          payload.quantity,
          payload.unit,
          payload.purchase_date,
          payload.purchase_rate,
          payload.current_rate,
          payload.purchase_value,
          payload.current_value,
          payload.status,
          payload.notes,
          id,
        ],
      );
      return;
    }
    await sql(
      `INSERT INTO physical_assets (asset_type,asset_name,holder_name,quantity,unit,purchase_date,purchase_rate,current_rate,purchase_value,current_value,status,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        payload.asset_type,
        payload.asset_name,
        payload.holder_name,
        payload.quantity,
        payload.unit,
        payload.purchase_date,
        payload.purchase_rate,
        payload.current_rate,
        payload.purchase_value,
        payload.current_value,
        payload.status,
        payload.notes,
      ],
    );
  },

  listLinks: async () => (await sql<FDLoanLink>("SELECT * FROM fd_loan_link")).map(normalize),
  listIncentives: async () => (await sql<Incentive>("SELECT * FROM incentive_tracker ORDER BY expected_date ASC")).map(normalize),

  listEquityHoldings: async () => (await sql<EquityHolding>("SELECT * FROM equity_holdings ORDER BY current_value DESC")).map(normalize),
  listEquityTransactions: async () => (await sql<EquityTransaction>("SELECT * FROM equity_transactions ORDER BY txn_date DESC")).map(normalize),
  listCasRuns: async () => (await sql<CasImportRun>("SELECT * FROM cas_import_runs ORDER BY imported_at DESC LIMIT 10")).map(normalize),
  replaceEquityData: async (fileName: string, holdings: Omit<EquityHolding, "id">[], txns: Omit<EquityTransaction, "id">[]) => {
    await sql("DELETE FROM equity_holdings");
    await sql("DELETE FROM equity_transactions");
    for (const h of holdings) {
      await sql(
        `INSERT INTO equity_holdings (source,asset_type,folio_or_account,instrument_name,symbol,isin,quantity,average_cost,invested_value,current_value,valuation_date,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          h.source,
          h.asset_type,
          h.folio_or_account,
          h.instrument_name,
          h.symbol,
          h.isin,
          h.quantity,
          h.average_cost,
          h.invested_value,
          h.current_value,
          h.valuation_date,
          h.notes,
        ],
      );
    }
    for (const t of txns) {
      await sql(
        `INSERT INTO equity_transactions (source,asset_type,instrument_name,symbol,isin,txn_type,txn_date,quantity,price,amount,folio_or_account,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          t.source,
          t.asset_type,
          t.instrument_name,
          t.symbol,
          t.isin,
          t.txn_type,
          t.txn_date,
          t.quantity,
          t.price,
          t.amount,
          t.folio_or_account,
          t.notes,
        ],
      );
    }

    await sql(`INSERT INTO cas_import_runs (file_name,imported_at,records_count,notes) VALUES (?,?,?,?)`, [
      fileName,
      dayjs().format("YYYY-MM-DD HH:mm:ss"),
      holdings.length + txns.length,
      `Holdings: ${holdings.length}, Transactions: ${txns.length}`,
    ]);
  },

  listAlerts: async () => (await sql<AlertItem>("SELECT * FROM alerts ORDER BY due_date ASC")).map(normalize),
  replaceAlerts: async (alerts: Omit<AlertItem, "id">[]) => {
    await sql("DELETE FROM alerts");
    for (const a of alerts) {
      await sql(`INSERT INTO alerts (alert_type,title,message,related_entity_type,related_entity_id,due_date,status,created_at) VALUES (?,?,?,?,?,?,?,?)`, [
        a.alert_type,
        a.title,
        a.message,
        a.related_entity_type,
        a.related_entity_id,
        a.due_date,
        a.status,
        a.created_at,
      ]);
    }
  },
};

function sumBondPendingCoupons(coupons: BondCoupon[]) {
  return coupons.reduce((s, c) => s + Math.max(c.expected_amount - c.received_amount, 0), 0);
}

export function buildMetrics(
  fds: FD[],
  loans: Loan[],
  links: FDLoanLink[],
  incentives: Incentive[],
  rds: RD[] = [],
  bonds: Bond[] = [],
  bondCoupons: BondCoupon[] = [],
  holdings: EquityHolding[] = [],
  epfAccounts: EPFAccount[] = [],
  ppfAccounts: PPFAccount[] = [],
  insurancePolicies: InsurancePolicy[] = [],
  physicalAssets: PhysicalAsset[] = [],
) {
  const activeFDs = fds.filter((f) => f.status === "active");
  const activeRds = rds.filter((r) => r.status === "active");
  const activeBonds = bonds.filter((b) => b.status === "active");

  const fdAssets = activeFDs.reduce((s, f) => s + f.principal, 0);
  const rdAssets = activeRds.reduce((s, r) => s + r.monthly_installment * r.installments_paid, 0);
  const bondAssets = activeBonds.reduce((s, b) => s + b.principal_invested, 0);
  const equityAssets = holdings.reduce((s, h) => s + h.current_value, 0);
  const epfAssets = epfAccounts.filter((e) => e.status === "active").reduce((s, e) => s + e.current_balance, 0);
  const ppfAssets = ppfAccounts.filter((p) => p.status === "active").reduce((s, p) => s + p.current_balance, 0);
  const physicalAssetValue = physicalAssets.filter((p) => p.status === "active").reduce((s, p) => s + p.current_value, 0);

  const totalAssets = fdAssets + rdAssets + bondAssets + equityAssets + epfAssets + ppfAssets + physicalAssetValue;
  const totalLiabilities = loans.filter((l) => l.status === "active").reduce((s, l) => s + l.outstanding_principal, 0);

  const loanBackedDeposits = activeFDs
    .filter((f) => f.funding_type.toLowerCase().includes("loan") || !!f.linked_loan_id)
    .reduce((s, f) => s + f.principal, 0);

  const reservedDeposits =
    activeFDs.filter((f) => !!f.reserved_for).reduce((s, f) => s + f.principal, 0) +
    activeRds.filter((r) => !!r.reserved_for).reduce((s, r) => s + r.monthly_installment * r.installments_paid, 0);

  const pendingIncentives = incentives.reduce((s, i) => s + i.pending_amount, 0);
  const pendingBondCoupons = sumBondPendingCoupons(bondCoupons);
  const insuranceDueCount = insurancePolicies.filter(
    (p) => p.status === "active" && dayjs(p.next_due_date).diff(dayjs(), "day") <= 30,
  ).length;

  const fdById = new Map(fds.map((f) => [f.id, f]));
  const loanById = new Map(loans.map((l) => [l.id, l]));
  const estimatedSpreadIncome = links.reduce((s, link) => {
    const fd = fdById.get(link.fd_id);
    const loan = loanById.get(link.loan_id);
    if (!fd || !loan) return s;
    return s + (link.linked_amount * (fd.interest_rate - loan.interest_rate)) / 100;
  }, 0);

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    investableWealth: totalAssets - totalLiabilities - loanBackedDeposits - reservedDeposits,
    activeFDValue: fdAssets,
    activeRDValue: rdAssets,
    bondValue: bondAssets,
    equityValue: equityAssets,
    epfValue: epfAssets,
    ppfValue: ppfAssets,
    physicalAssetValue,
    loanBackedDeposits,
    reservedDeposits,
    pendingIncentives,
    pendingBondCoupons,
    insuranceDueCount,
    estimatedSpreadIncome,
  };
}

export async function regenerateAlerts(
  fds: FD[],
  loans: Loan[],
  links: FDLoanLink[],
  incentives: Incentive[],
  rds: RD[] = [],
  bonds: Bond[] = [],
  bondCoupons: BondCoupon[] = [],
  epfAccounts: EPFAccount[] = [],
  ppfAccounts: PPFAccount[] = [],
  insurancePolicies: InsurancePolicy[] = [],
) {
  const now = dayjs();
  const alerts: Omit<AlertItem, "id">[] = [];

  fds.forEach((fd) => {
    const d = dayjs(fd.maturity_date).diff(now, "day");
    if (d <= 30) {
      alerts.push({
        alert_type: fd.reserved_for ? "reserved_fd_maturing" : "fd_maturity_due",
        title: `${fd.bank_name} FD maturing`,
        message: `FD ${fd.fd_number} matures in ${d} days`,
        related_entity_type: "fd",
        related_entity_id: fd.id,
        due_date: fd.maturity_date,
        status: d < 0 ? "overdue" : "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  rds.forEach((rd) => {
    const d = dayjs(rd.maturity_date).diff(now, "day");
    if (d <= 30) {
      alerts.push({
        alert_type: "rd_maturity_due",
        title: `${rd.bank_name} RD maturing`,
        message: `RD ${rd.rd_number} matures in ${d} days`,
        related_entity_type: "rd",
        related_entity_id: rd.id,
        due_date: rd.maturity_date,
        status: d < 0 ? "overdue" : "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  loans.forEach((loan) => {
    const d = dayjs(loan.end_date).diff(now, "day");
    if (d <= 30) {
      alerts.push({
        alert_type: "loan_due",
        title: `${loan.bank_name} loan due`,
        message: `Loan ${loan.account_number} closes in ${d} days`,
        related_entity_type: "loan",
        related_entity_id: loan.id,
        due_date: loan.end_date,
        status: d < 0 ? "overdue" : "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  incentives.forEach((i) => {
    if (i.pending_amount > 0 && dayjs(i.expected_date).isBefore(now, "day")) {
      alerts.push({
        alert_type: "incentive_overdue",
        title: `${i.bank_name} incentive overdue`,
        message: `Pending incentive: ${i.pending_amount}`,
        related_entity_type: "incentive",
        related_entity_id: i.id,
        due_date: i.expected_date,
        status: "overdue",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  links.forEach((link) => {
    const fd = fds.find((f) => f.id === link.fd_id);
    const loan = loans.find((l) => l.id === link.loan_id);
    if (fd && loan && fd.interest_rate < loan.interest_rate) {
      alerts.push({
        alert_type: "negative_spread",
        title: "Negative spread detected",
        message: `${fd.bank_name} FD ${fd.interest_rate}% < ${loan.bank_name} loan ${loan.interest_rate}%`,
        related_entity_type: "fd_loan_link",
        related_entity_id: link.id,
        due_date: now.format("YYYY-MM-DD"),
        status: "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  bonds.forEach((bond) => {
    const maturityDays = dayjs(bond.maturity_date).diff(now, "day");
    if (maturityDays <= 45) {
      alerts.push({
        alert_type: "bond_maturity_due",
        title: `${bond.issuer_name} bond maturing`,
        message: `${bond.platform} bond matures in ${maturityDays} days`,
        related_entity_type: "bond",
        related_entity_id: bond.id,
        due_date: bond.maturity_date,
        status: maturityDays < 0 ? "overdue" : "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  bondCoupons.forEach((coupon) => {
    const pending = coupon.expected_amount - coupon.received_amount;
    if (pending > 0 && dayjs(coupon.due_date).diff(now, "day") <= 7) {
      alerts.push({
        alert_type: "bond_coupon_due",
        title: "Bond coupon due",
        message: `Coupon pending amount ${pending.toFixed(0)}`,
        related_entity_type: "bond_coupon",
        related_entity_id: coupon.id,
        due_date: coupon.due_date,
        status: dayjs(coupon.due_date).isBefore(now, "day") ? "overdue" : "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  ppfAccounts.forEach((ppf) => {
    const remaining = Math.max(ppf.target_contribution_fy - ppf.contribution_this_fy, 0);
    const deadlineDiff = dayjs(ppf.fy_deadline_date).diff(now, "day");
    if (remaining > 0 && deadlineDiff <= 45) {
      alerts.push({
        alert_type: "ppf_contribution_due",
        title: `${ppf.bank_name} PPF contribution pending`,
        message: `Remaining FY contribution ${remaining.toFixed(0)}; deadline in ${deadlineDiff} days`,
        related_entity_type: "ppf",
        related_entity_id: ppf.id,
        due_date: ppf.fy_deadline_date,
        status: deadlineDiff < 0 ? "overdue" : "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  insurancePolicies.forEach((policy) => {
    const diff = dayjs(policy.next_due_date).diff(now, "day");
    if (policy.status === "active" && diff <= 30) {
      alerts.push({
        alert_type: "insurance_premium_due",
        title: `${policy.insurer_name} premium due`,
        message: `${policy.policy_type} policy ${policy.policy_number} premium due in ${diff} days`,
        related_entity_type: "insurance",
        related_entity_id: policy.id,
        due_date: policy.next_due_date,
        status: diff < 0 ? "overdue" : "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  epfAccounts.forEach((epf) => {
    const nextInterestDate = dayjs(epf.last_interest_credit_date).add(12, "month");
    const diff = nextInterestDate.diff(now, "day");
    if (epf.status === "active" && diff <= 30) {
      alerts.push({
        alert_type: "epf_interest_check",
        title: `${epf.employer_name} EPF interest cycle`,
        message: `EPF interest credit checkpoint in ${diff} days`,
        related_entity_type: "epf",
        related_entity_id: epf.id,
        due_date: nextInterestDate.format("YYYY-MM-DD"),
        status: diff < 0 ? "overdue" : "open",
        created_at: now.format("YYYY-MM-DD"),
      });
    }
  });

  await repo.replaceAlerts(alerts);
}
