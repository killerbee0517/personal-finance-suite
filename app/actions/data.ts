"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCasFile } from "@/lib/cas";
import { ensureInitialized, resetSeedData } from "@/lib/init";
import { bondSchema, epfSchema, fdSchema, insuranceSchema, loanSchema, ppfSchema, rdSchema } from "@/lib/schemas";
import { regenerateAlerts, repo } from "@/lib/services";

const toObj = (fd: FormData) => Object.fromEntries(fd.entries());

async function refreshAlertsAndViews() {
  await regenerateAlerts(
    await repo.listFDs(),
    await repo.listLoans(),
    await repo.listLinks(),
    await repo.listIncentives(),
    await repo.listRDs(),
    await repo.listBonds(),
    await repo.listBondCoupons(),
    await repo.listEPFAccounts(),
    await repo.listPPFAccounts(),
    await repo.listInsurancePolicies(),
  );

  ["/dashboard", "/alerts", "/fds", "/loans", "/rds", "/bonds", "/equity", "/epf", "/ppf", "/insurance", "/calendar"].forEach((p) =>
    revalidatePath(p),
  );
}

export async function saveFDAction(formData: FormData) {
  const ready = await ensureInitialized();
  if (!ready) throw new Error("DB not connected");

  const idRaw = formData.get("id");
  const payload = fdSchema.parse(toObj(formData));
  const tenure = dayjs(payload.maturity_date).diff(dayjs(payload.deposit_date), "day");
  const expected = payload.principal + (payload.principal * payload.interest_rate * tenure) / 36500;
  const renewalFromId = payload.renewal_from_fd_id || null;
  const renewalSource = renewalFromId ? await repo.getFD(renewalFromId) : undefined;
  const extraAmount = renewalSource ? Math.max(payload.principal - renewalSource.principal, 0) : 0;
  const isRenewal = !!renewalSource;

  await repo.saveFD(
    {
      instrument_type: payload.instrument_type,
      holder_name: payload.holder_name,
      bank_name: payload.bank_name,
      branch: payload.branch,
      fd_number: payload.fd_number,
      deposit_date: payload.deposit_date,
      maturity_date: payload.maturity_date,
      principal: payload.principal,
      interest_rate: payload.interest_rate,
      tenure_days: tenure,
      maturity_value_expected: expected,
      maturity_value_actual: null,
      payout_type: payload.payout_type,
      status: payload.status,
      funding_type: payload.funding_type,
      linked_loan_id: payload.linked_loan_id || null,
      reserved_for: payload.reserved_for || null,
      renewal_flag: isRenewal ? 1 : 0,
      renewal_from_fd_id: renewalFromId,
      renewal_date: isRenewal ? payload.deposit_date : null,
      renewal_new_fd_amount: isRenewal ? payload.principal : null,
      extra_amount_added: extraAmount,
      incentive_expected: payload.incentive_expected || 0,
      incentive_received: payload.incentive_received || 0,
      certificate_received: payload.certificate_received ? 1 : 0,
      certificate_received_date: payload.certificate_received_date || null,
      raised_by_name: payload.raised_by_name || null,
      raised_by_contact: payload.raised_by_contact || null,
      raised_under_name: payload.raised_under_name || null,
      nominee_name: payload.nominee_name || null,
      remarks: payload.remarks || null,
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  if (isRenewal && renewalSource) {
    const { id: _srcId, ...src } = renewalSource;
    await repo.saveFD(
      {
        ...src,
        status: renewalSource.status === "active" ? "renewed" : renewalSource.status,
        renewal_flag: 1,
        renewal_from_fd_id: renewalSource.renewal_from_fd_id || null,
        renewal_date: payload.deposit_date,
        renewal_new_fd_amount: payload.principal,
        extra_amount_added: extraAmount,
        certificate_received: renewalSource.certificate_received || 0,
        certificate_received_date: renewalSource.certificate_received_date || null,
        raised_by_name: renewalSource.raised_by_name || null,
        raised_by_contact: renewalSource.raised_by_contact || null,
        raised_under_name: renewalSource.raised_under_name || null,
        nominee_name: renewalSource.nominee_name || null,
      },
      renewalSource.id,
    );
  }

  await refreshAlertsAndViews();
  redirect("/fds");
}

export async function saveLoanAction(formData: FormData) {
  const ready = await ensureInitialized();
  if (!ready) throw new Error("DB not connected");

  const idRaw = formData.get("id");
  const payload = loanSchema.parse(toObj(formData));

  await repo.saveLoan(
    {
      loan_type: payload.loan_type,
      holder_name: payload.holder_name,
      bank_name: payload.bank_name,
      account_number: payload.account_number,
      start_date: payload.start_date,
      end_date: payload.end_date,
      principal_amount: payload.principal_amount,
      interest_rate: payload.interest_rate,
      repayment_type: payload.repayment_type,
      emi_amount: payload.emi_amount || 0,
      outstanding_principal: payload.outstanding_principal,
      bullet_closure_amount: payload.bullet_closure_amount || 0,
      status: payload.status,
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  await refreshAlertsAndViews();
  redirect("/loans");
}

export async function saveRDAction(formData: FormData) {
  const ready = await ensureInitialized();
  if (!ready) throw new Error("DB not connected");

  const idRaw = formData.get("id");
  const payload = rdSchema.parse(toObj(formData));
  const months = Math.max(dayjs(payload.maturity_date).diff(dayjs(payload.start_date), "month"), payload.total_installments);
  const principal = payload.monthly_installment * payload.total_installments;
  const expected = principal + (principal * payload.interest_rate * months) / 1200;

  await repo.saveRD(
    {
      holder_name: payload.holder_name,
      bank_name: payload.bank_name,
      branch: payload.branch,
      rd_number: payload.rd_number,
      start_date: payload.start_date,
      maturity_date: payload.maturity_date,
      monthly_installment: payload.monthly_installment,
      total_installments: payload.total_installments,
      installments_paid: payload.installments_paid,
      interest_rate: payload.interest_rate,
      maturity_value_expected: expected,
      maturity_value_actual: null,
      status: payload.status,
      reserved_for: payload.reserved_for || null,
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  await refreshAlertsAndViews();
  redirect("/rds");
}

function buildCoupons(
  investmentDate: string,
  maturityDate: string,
  principal: number,
  couponRate: number,
  payoutFrequency: string,
  payoutDay: number,
) {
  const coupons: Array<{
    due_date: string;
    expected_amount: number;
    received_amount: number;
    status: string;
    received_date: null;
    notes: string | null;
  }> = [];

  const start = dayjs(investmentDate);
  const end = dayjs(maturityDate);
  const stepMonths = payoutFrequency.toLowerCase() === "monthly" ? 1 : 3;

  let cursor = start.add(stepMonths, "month").date(Math.min(Math.max(payoutDay, 1), 28));
  while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
    const amount = (principal * couponRate * stepMonths) / 1200;
    coupons.push({
      due_date: cursor.format("YYYY-MM-DD"),
      expected_amount: Number(amount.toFixed(2)),
      received_amount: 0,
      status: "pending",
      received_date: null,
      notes: null,
    });
    cursor = cursor.add(stepMonths, "month");
  }

  return coupons;
}

export async function saveBondAction(formData: FormData) {
  const ready = await ensureInitialized();
  if (!ready) throw new Error("DB not connected");

  const idRaw = formData.get("id");
  const payload = bondSchema.parse(toObj(formData));
  const bondId = idRaw ? Number(idRaw) : undefined;

  await repo.saveBond(
    {
      platform: payload.platform,
      issuer_name: payload.issuer_name,
      bond_name: payload.bond_name,
      isin: payload.isin,
      holder_name: payload.holder_name,
      investment_date: payload.investment_date,
      maturity_date: payload.maturity_date,
      principal_invested: payload.principal_invested,
      face_value: payload.face_value,
      coupon_rate: payload.coupon_rate,
      payout_frequency: payload.payout_frequency,
      payout_day: payload.payout_day,
      units: payload.units,
      status: payload.status,
      notes: payload.notes || null,
    },
    bondId,
  );

  const target = bondId ? await repo.getBond(bondId) : (await repo.listBonds()).sort((a, b) => b.id - a.id)[0];
  if (target) {
    await repo.saveBondCoupons(
      target.id,
      buildCoupons(
        target.investment_date,
        target.maturity_date,
        target.principal_invested,
        target.coupon_rate,
        target.payout_frequency,
        target.payout_day,
      ),
    );
  }

  await refreshAlertsAndViews();
  redirect("/bonds");
}

export async function saveEPFAction(formData: FormData) {
  const ready = await ensureInitialized();
  if (!ready) throw new Error("DB not connected");

  const idRaw = formData.get("id");
  const payload = epfSchema.parse(toObj(formData));
  await repo.saveEPFAccount(
    {
      employer_name: payload.employer_name,
      uan: payload.uan,
      member_id: payload.member_id,
      current_balance: payload.current_balance,
      employee_monthly: payload.employee_monthly,
      employer_monthly: payload.employer_monthly,
      interest_rate: payload.interest_rate,
      last_interest_credit_date: payload.last_interest_credit_date,
      status: payload.status,
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  await refreshAlertsAndViews();
  redirect("/epf");
}

export async function savePPFAction(formData: FormData) {
  const ready = await ensureInitialized();
  if (!ready) throw new Error("DB not connected");

  const idRaw = formData.get("id");
  const payload = ppfSchema.parse(toObj(formData));
  await repo.savePPFAccount(
    {
      bank_name: payload.bank_name,
      account_number: payload.account_number,
      holder_name: payload.holder_name,
      start_date: payload.start_date,
      maturity_date: payload.maturity_date,
      extension_years: payload.extension_years,
      current_balance: payload.current_balance,
      contribution_this_fy: payload.contribution_this_fy,
      target_contribution_fy: payload.target_contribution_fy,
      fy_deadline_date: payload.fy_deadline_date,
      last_contribution_date: payload.last_contribution_date || null,
      status: payload.status,
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  await refreshAlertsAndViews();
  redirect("/ppf");
}

export async function saveInsuranceAction(formData: FormData) {
  const ready = await ensureInitialized();
  if (!ready) throw new Error("DB not connected");

  const idRaw = formData.get("id");
  const payload = insuranceSchema.parse(toObj(formData));
  await repo.saveInsurancePolicy(
    {
      policy_type: payload.policy_type,
      insurer_name: payload.insurer_name,
      policy_number: payload.policy_number,
      holder_name: payload.holder_name,
      sum_assured: payload.sum_assured,
      premium_amount: payload.premium_amount,
      premium_frequency: payload.premium_frequency,
      next_due_date: payload.next_due_date,
      grace_days: payload.grace_days,
      start_date: payload.start_date,
      end_date: payload.end_date || null,
      nominee_name: payload.nominee_name || null,
      status: payload.status,
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  await refreshAlertsAndViews();
  redirect("/insurance");
}

export async function importCasAction(formData: FormData) {
  const ready = await ensureInitialized();
  if (!ready) throw new Error("DB not connected");

  const file = formData.get("cas_file");
  if (!(file instanceof File)) {
    throw new Error("No file selected");
  }

  const parsed = await parseCasFile(file);
  const holdings = parsed.holdings.map((h) => ({
    source: h.source,
    asset_type: h.asset_type,
    folio_or_account: h.folio_or_account || null,
    instrument_name: h.instrument_name,
    symbol: h.symbol || null,
    isin: h.isin || null,
    quantity: h.quantity,
    average_cost: h.average_cost,
    invested_value: Number((h.quantity * h.average_cost).toFixed(2)),
    current_value: h.current_value,
    valuation_date: h.valuation_date,
    notes: null,
  }));

  const txns = parsed.transactions.map((t) => ({
    source: t.source,
    asset_type: t.asset_type,
    instrument_name: t.instrument_name,
    symbol: t.symbol || null,
    isin: t.isin || null,
    txn_type: t.txn_type,
    txn_date: t.txn_date,
    quantity: t.quantity,
    price: t.price,
    amount: t.amount,
    folio_or_account: t.folio_or_account || null,
    notes: null,
  }));

  await repo.replaceEquityData(file.name, holdings, txns);
  await refreshAlertsAndViews();

  const warningTag = parsed.warnings.length ? `?warnings=${encodeURIComponent(parsed.warnings.join(" | "))}` : "";
  redirect(`/equity${warningTag}`);
}

export async function resetDataAction() {
  const ready = await ensureInitialized();
  if (!ready) throw new Error("DB not connected");

  await resetSeedData();
  await refreshAlertsAndViews();
  revalidatePath("/");
  redirect("/settings");
}
