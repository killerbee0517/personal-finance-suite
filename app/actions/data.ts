"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCasFile } from "@/lib/cas";
import { applyBackupImportPreview, createBackupImportPreview, deleteBackupImportPreview } from "@/lib/backup";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureInitialized, resetSeedData } from "@/lib/init";
import { bondSchema, epfSchema, fdSchema, insuranceSchema, loanSchema, physicalAssetSchema, ppfSchema, rdSchema } from "@/lib/schemas";
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

  ["/dashboard", "/alerts", "/fds", "/loans", "/rds", "/bonds", "/equity", "/epf", "/ppf", "/insurance", "/physical", "/certificates", "/calendar", "/calculators", "/cashflows"].forEach((p) =>
    revalidatePath(p),
  );
}

async function requireReadyAndAuth() {
  const ready = await ensureInitialized();
  if (!ready) throw new Error("DB not connected");
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (isSuperAdmin(me)) redirect("/users?error=Platform admin cannot access household finance actions");
  return me;
}

export async function saveFDAction(formData: FormData) {
  await requireReadyAndAuth();

  const idRaw = formData.get("id");
  const existing = idRaw ? await repo.getFD(Number(idRaw)) : undefined;
  const raw = toObj(formData) as Record<string, unknown>;

  if (existing) {
    const requiredFallbacks: Array<keyof typeof existing> = [
      "instrument_type",
      "institution_type",
      "holder_name",
      "bank_name",
      "branch",
      "fd_number",
      "deposit_date",
      "maturity_date",
      "payout_type",
      "funding_type",
    ];
    for (const key of requiredFallbacks) {
      const v = raw[key as string];
      if (v === "" || v === null || v === undefined) {
        raw[key as string] = existing[key] ?? "";
      }
    }
  }

  const parsed = fdSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "field"}: ${issue.message}`)
      .join(" | ");
    const target = idRaw
      ? `/fds/${Number(idRaw)}?error=${encodeURIComponent(message)}`
      : `/fds/new?error=${encodeURIComponent(message)}`;
    redirect(target);
  }
  const payload = parsed.data;
  const tenure = dayjs(payload.maturity_date).diff(dayjs(payload.deposit_date), "day");
  const expected = payload.principal + (payload.principal * payload.interest_rate * tenure) / 36500;
  const renewalFromId = payload.renewal_from_fd_id || null;
  const renewalSource = renewalFromId ? await repo.getFD(renewalFromId) : undefined;
  const extraAmount = renewalSource ? Math.max(payload.principal - renewalSource.principal, 0) : 0;
  const isRenewal = !!renewalSource;
  const incentivePercentage = payload.incentive_percentage || 0;
  const incentiveExpectedFromPercent = Number(((payload.principal * incentivePercentage) / 100).toFixed(2));

  await repo.saveFD(
    {
      instrument_type: payload.instrument_type,
      institution_type: payload.institution_type,
      holder_name: payload.holder_name,
      funded_by_name: payload.funded_by_name || payload.holder_name,
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
      status: payload.status || existing?.status || "active",
      funding_type: payload.funding_type,
      linked_loan_id: payload.linked_loan_id || null,
      reserved_for: payload.reserved_for || null,
      renewal_flag: isRenewal ? 1 : 0,
      renewal_from_fd_id: renewalFromId,
      renewal_date: isRenewal ? payload.deposit_date : null,
      renewal_new_fd_amount: isRenewal ? payload.principal : null,
      extra_amount_added: extraAmount,
      incentive_expected: incentiveExpectedFromPercent,
      incentive_received: payload.incentive_received || 0,
      incentive_percentage: incentivePercentage,
      certificate_received: payload.certificate_received ? 1 : 0,
      certificate_received_date: payload.certificate_received_date || null,
      is_joint_account: payload.is_joint_account ? 1 : 0,
      payment_mode: payload.payment_mode || "bank_transfer",
      raised_by_name: payload.raised_by_name || null,
      raised_by_contact: payload.raised_by_contact || null,
      raised_under_name: payload.raised_under_name || null,
      nominee_name: payload.nominee_name || null,
      remarks: payload.remarks || null,
      notes: payload.remarks || null,
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
        institution_type: renewalSource.institution_type || "bank",
        funded_by_name: renewalSource.funded_by_name || renewalSource.holder_name,
        incentive_percentage: renewalSource.incentive_percentage || 0,
        certificate_received: renewalSource.certificate_received || 0,
        certificate_received_date: renewalSource.certificate_received_date || null,
        is_joint_account: renewalSource.is_joint_account || 0,
        payment_mode: renewalSource.payment_mode || "bank_transfer",
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

export async function processFDRenewalAction(formData: FormData) {
  await requireReadyAndAuth();

  const sourceId = Number(formData.get("source_fd_id"));
  const actionType = String(formData.get("renewal_action") || "renew");
  const actionDate = String(formData.get("action_date") || dayjs().format("YYYY-MM-DD"));
  const newFdNumber = String(formData.get("new_fd_number") || "");
  const additionalAmount = Number(formData.get("additional_amount") || 0);
  const creditedAmount = Number(formData.get("credited_amount") || 0);
  const remarks = String(formData.get("remarks") || "");

  if (!Number.isFinite(sourceId)) throw new Error("Invalid source deposit id");
  const source = await repo.getFD(sourceId);
  if (!source) throw new Error("Source deposit not found");

  if (actionType === "renew") {
    const nextPrincipal = Number((source.principal + Math.max(additionalAmount, 0)).toFixed(2));
    const newMaturityDate = dayjs(actionDate).add(source.tenure_days || 365, "day").format("YYYY-MM-DD");
    const tenure = dayjs(newMaturityDate).diff(dayjs(actionDate), "day");
    const expected = nextPrincipal + (nextPrincipal * source.interest_rate * tenure) / 36500;
    const incentivePct = source.incentive_percentage || 0;
    const nextIncentiveExpected = Number(((nextPrincipal * incentivePct) / 100).toFixed(2));

    await repo.saveFD(
      {
        ...source,
        fd_number: newFdNumber || `${source.fd_number}-R${dayjs(actionDate).format("YYMMDD")}`,
        deposit_date: actionDate,
        maturity_date: newMaturityDate,
        principal: nextPrincipal,
        tenure_days: tenure,
        maturity_value_expected: expected,
        maturity_value_actual: null,
        status: "active",
        renewal_flag: 1,
        renewal_from_fd_id: source.id,
        renewal_date: actionDate,
        renewal_new_fd_amount: nextPrincipal,
        extra_amount_added: Math.max(additionalAmount, 0),
        incentive_expected: nextIncentiveExpected,
        incentive_received: 0,
        certificate_received: 0,
        certificate_received_date: null,
        remarks: remarks || source.remarks,
        notes: remarks || source.notes,
      },
      undefined,
    );

    await repo.saveFD(
      {
        ...source,
        status: source.status === "active" ? "renewed" : source.status,
        renewal_flag: 1,
        renewal_date: actionDate,
        renewal_new_fd_amount: nextPrincipal,
        extra_amount_added: Math.max(additionalAmount, 0),
        remarks: remarks || source.remarks,
        notes: remarks || source.notes,
      },
      source.id,
    );
  } else {
    await repo.saveFD(
      {
        ...source,
        status: "closed_credited",
        maturity_value_actual: creditedAmount > 0 ? creditedAmount : source.maturity_value_actual,
        renewal_flag: 0,
        renewal_date: actionDate,
        renewal_new_fd_amount: null,
        extra_amount_added: 0,
        remarks: remarks || source.remarks,
        notes: remarks || source.notes,
      },
      source.id,
    );
  }

  await refreshAlertsAndViews();
  redirect(`/fds/${source.id}`);
}

export async function saveLoanAction(formData: FormData) {
  await requireReadyAndAuth();

  const idRaw = formData.get("id");
  const existing = idRaw ? await repo.getLoan(Number(idRaw)) : undefined;
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
      status: payload.status || existing?.status || "active",
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  await refreshAlertsAndViews();
  redirect("/loans");
}

export async function saveRDAction(formData: FormData) {
  await requireReadyAndAuth();

  const idRaw = formData.get("id");
  const existing = idRaw ? await repo.getRD(Number(idRaw)) : undefined;
  const payload = rdSchema.parse(toObj(formData));
  const months = Math.max(dayjs(payload.maturity_date).diff(dayjs(payload.start_date), "month"), payload.total_installments);
  const principal = payload.monthly_installment * payload.total_installments;
  const expectedAuto = principal + (principal * payload.interest_rate * months) / 1200;
  const expected = payload.maturity_value_expected && payload.maturity_value_expected > 0 ? payload.maturity_value_expected : expectedAuto;

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
      status: payload.status || existing?.status || "active",
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
  await requireReadyAndAuth();

  const idRaw = formData.get("id");
  const existing = idRaw ? await repo.getBond(Number(idRaw)) : undefined;
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
      status: payload.status || existing?.status || "active",
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
  await requireReadyAndAuth();

  const idRaw = formData.get("id");
  const existing = idRaw ? await repo.getEPFAccount(Number(idRaw)) : undefined;
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
      status: payload.status || existing?.status || "active",
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  await refreshAlertsAndViews();
  redirect("/epf");
}

export async function savePPFAction(formData: FormData) {
  await requireReadyAndAuth();

  const idRaw = formData.get("id");
  const existing = idRaw ? await repo.getPPFAccount(Number(idRaw)) : undefined;
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
      status: payload.status || existing?.status || "active",
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  await refreshAlertsAndViews();
  redirect("/ppf");
}

export async function saveInsuranceAction(formData: FormData) {
  await requireReadyAndAuth();

  const idRaw = formData.get("id");
  const existing = idRaw ? await repo.getInsurancePolicy(Number(idRaw)) : undefined;
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
      status: payload.status || existing?.status || "active",
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  await refreshAlertsAndViews();
  redirect("/insurance");
}

export async function savePhysicalAssetAction(formData: FormData) {
  await requireReadyAndAuth();

  const idRaw = formData.get("id");
  const existing = idRaw ? await repo.getPhysicalAsset(Number(idRaw)) : undefined;
  const payload = physicalAssetSchema.parse(toObj(formData));
  const purchaseValue = Number((payload.quantity * payload.purchase_rate).toFixed(2));
  const currentValue = Number((payload.quantity * payload.current_rate).toFixed(2));

  await repo.savePhysicalAsset(
    {
      asset_type: payload.asset_type,
      asset_name: payload.asset_name,
      holder_name: payload.holder_name,
      quantity: payload.quantity,
      unit: payload.unit,
      purchase_date: payload.purchase_date,
      purchase_rate: payload.purchase_rate,
      current_rate: payload.current_rate,
      purchase_value: purchaseValue,
      current_value: currentValue,
      status: payload.status || existing?.status || "active",
      notes: payload.notes || null,
    },
    idRaw ? Number(idRaw) : undefined,
  );

  await refreshAlertsAndViews();
  redirect("/physical");
}

export async function updateCertificateReceiptAction(formData: FormData) {
  await requireReadyAndAuth();

  const fdId = Number(formData.get("fd_id"));
  const receivedDate = String(formData.get("certificate_received_date") || dayjs().format("YYYY-MM-DD"));
  if (!Number.isFinite(fdId)) throw new Error("Invalid deposit id");

  const fd = await repo.getFD(fdId);
  if (!fd) throw new Error("Deposit not found");
  const { id: _fdId, ...payload } = fd;

  await repo.saveFD(
    {
      ...payload,
      certificate_received: 1,
      certificate_received_date: receivedDate,
    },
    fdId,
  );

  await refreshAlertsAndViews();
  redirect("/certificates");
}

export async function postIncentiveReceiptAction(formData: FormData) {
  await requireReadyAndAuth();

  const incentiveId = Number(formData.get("incentive_id"));
  const amount = Number(formData.get("received_amount") || 0);
  const receivedDate = String(formData.get("received_date") || dayjs().format("YYYY-MM-DD"));

  if (!Number.isFinite(incentiveId) || amount <= 0) {
    redirect("/incentives?error=Invalid incentive receipt input");
  }

  await repo.updateIncentiveReceipt(incentiveId, amount, receivedDate);
  await refreshAlertsAndViews();
  redirect("/incentives?updated=1");
}

export async function markAlertReadAction(formData: FormData) {
  await requireReadyAndAuth();

  const alertId = Number(formData.get("alert_id"));
  if (!Number.isFinite(alertId)) redirect("/alerts?error=Invalid alert id");

  await repo.updateAlertStatus(alertId, "read");
  revalidatePath("/alerts");
  revalidatePath("/dashboard");
  revalidatePath("/api/alerts/summary");
  redirect("/alerts");
}

export async function importCasAction(formData: FormData) {
  await requireReadyAndAuth();

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
  const me = await requireReadyAndAuth();

  if (me.username !== "dummy" || me.tenant_id !== 1) {
    redirect("/settings?error=Sample reset is available only for dummy account");
  }

  const otherUsers = await sql<{ c: number }>("SELECT COUNT(*) as c FROM app_users WHERE tenant_id <> 1");
  if ((otherUsers[0]?.c || 0) > 0) {
    redirect("/settings?error=Sample reset is disabled after real users are created");
  }

  await resetSeedData();
  await refreshAlertsAndViews();
  revalidatePath("/");
  redirect("/settings?updated=1");
}

export async function createBackupPreviewAction(formData: FormData) {
  await requireReadyAndAuth();

  const file = formData.get("backup_file");
  if (!(file instanceof File)) throw new Error("No backup file selected");

  const bytes = Buffer.from(await file.arrayBuffer());
  const previewId = await createBackupImportPreview(bytes, file.name);

  redirect(`/settings?preview=${previewId}`);
}

export async function applyBackupPreviewAction(formData: FormData) {
  await requireReadyAndAuth();

  const previewId = String(formData.get("preview_id") || "");
  if (!previewId) throw new Error("Preview id missing");

  await applyBackupImportPreview(previewId);
  await refreshAlertsAndViews();
  redirect("/settings?import=applied");
}

export async function rejectBackupPreviewAction(formData: FormData) {
  await requireReadyAndAuth();
  const previewId = String(formData.get("preview_id") || "");
  if (previewId) await deleteBackupImportPreview(previewId);
  redirect("/settings?import=rejected");
}

export async function addInvestmentCashflowAction(formData: FormData) {
  await requireReadyAndAuth();
  const instrumentType = String(formData.get("instrument_type") || "manual").trim() || "manual";
  const instrumentIdRaw = String(formData.get("instrument_id") || "").trim();
  const instrumentId = instrumentIdRaw ? Number(instrumentIdRaw) : null;
  const holderName = String(formData.get("holder_name") || "").trim();
  const fundedByName = String(formData.get("funded_by_name") || "").trim() || holderName;
  const cashflowDate = String(formData.get("cashflow_date") || dayjs().format("YYYY-MM-DD"));
  const amount = Number(formData.get("amount") || 0);
  const flowType = String(formData.get("flow_type") || "").trim() || (amount >= 0 ? "inflow" : "outflow");
  const source = String(formData.get("source") || "manual").trim() || "manual";
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!holderName || !Number.isFinite(amount) || amount === 0) {
    redirect("/cashflows?error=Holder and non-zero amount are required");
  }

  await repo.addInvestmentCashflow({
    instrument_type: instrumentType,
    instrument_id: Number.isFinite(instrumentId as number) ? instrumentId : null,
    holder_name: holderName,
    funded_by_name: fundedByName,
    cashflow_date: cashflowDate,
    amount,
    flow_type: flowType,
    source,
    notes,
  });
  await refreshAlertsAndViews();
  redirect("/cashflows?created=1");
}

export async function deleteInvestmentCashflowAction(formData: FormData) {
  await requireReadyAndAuth();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) redirect("/cashflows?error=Invalid cashflow id");
  await repo.deleteInvestmentCashflow(id);
  await refreshAlertsAndViews();
  redirect("/cashflows?deleted=1");
}


