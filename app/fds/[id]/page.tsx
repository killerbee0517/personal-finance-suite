import type { ReactNode } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { notFound } from "next/navigation";
import { saveFDAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { StatCard } from "@/components/StatCard";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { cagrPercent, estimateFDCurrentValue, potentialReturnPercent } from "@/lib/returns";
import { repo } from "@/lib/services";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const PAYOUT_OPTIONS = ["cumulative", "monthly", "quarterly", "on_maturity"];
const FUNDING_OPTIONS = ["self", "loan_backed", "family", "business"];
const RESERVED_OPTIONS = ["emergency", "education", "marriage", "tax", "medical", "other"];

const unique = (items: Array<string | null | undefined>) =>
  Array.from(new Set(items.map((x) => (x || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));

export default async function FDDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const error = (await searchParams)?.error;

  const [fdIdParam, allFds, loans] = await Promise.all([params, repo.listFDs(), repo.listLoans()]);
  const fd = allFds.find((x) => x.id === Number(fdIdParam.id));
  if (!fd) return notFound();

  const renewals = allFds.filter((x) => x.renewal_from_fd_id === fd.id).sort((a, b) => a.deposit_date.localeCompare(b.deposit_date));
  const holderSuggestions = unique(allFds.map((x) => x.holder_name));
  const fundedBySuggestions = unique([...allFds.map((x) => x.funded_by_name), ...holderSuggestions]);
  const bankSuggestions = unique(allFds.map((x) => x.bank_name));
  const nomineeSuggestions = unique(allFds.map((x) => x.nominee_name));
  const raisedBySuggestions = unique(allFds.map((x) => x.raised_by_name));
  const raisedUnderSuggestions = unique(allFds.map((x) => x.raised_under_name));
  const reservedForSuggestions = unique([...RESERVED_OPTIONS, ...allFds.map((x) => x.reserved_for)]);
  const today = dayjs().format("YYYY-MM-DD");
  const estimatedCurrent = estimateFDCurrentValue(fd, today);
  const currentCagr = cagrPercent(fd.principal, estimatedCurrent, fd.deposit_date, today);
  const potentialReturn = potentialReturnPercent(
    estimatedCurrent,
    fd.maturity_value_expected || fd.principal,
  );

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">Deposit Detail</h1>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="ta-card p-4 text-sm">
        {fd.instrument_type?.toUpperCase() || "FD"} | {fd.bank_name} | {fd.fd_number} | {formatCurrency(fd.principal)} | {fd.interest_rate}% | {fd.maturity_date}
        <div className="mt-3">
          <Link href={`/fds/${fd.id}/renew`} className="ta-btn">Renew / Credit Decision</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard label="Current CAGR" value={currentCagr ?? Number.NaN} valueType="percent" asOf={today} />
        <StatCard label="Potential Return" value={potentialReturn ?? Number.NaN} valueType="percent" asOf={fd.maturity_date} />
      </div>

      <form action={saveFDAction} className="ta-card space-y-4 p-5">
        <input type="hidden" name="id" value={fd.id} />
        <input type="hidden" name="status" value={fd.status} />

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Deposit Type">
            <select name="instrument_type" className="ta-input" defaultValue={fd.instrument_type || "fd"}>
              <option value="fd">Fixed Deposit</option>
              <option value="ncd">NCD</option>
              <option value="subordinate_debt">Subordinate Debt</option>
            </select>
          </Field>
          <Field label="Institution Type">
            <select name="institution_type" className="ta-input" defaultValue={fd.institution_type || "bank"}>
              <option value="bank">Bank</option>
              <option value="nbfc">NBFC</option>
              <option value="cooperative_society">Cooperative Society</option>
              <option value="nidhi">Nidhi</option>
            </select>
          </Field>
          <Field label="Holder Name"><input name="holder_name" className="ta-input" list="fd-holder-options" defaultValue={fd.holder_name} /></Field>
          <Field label="Funded By"><input name="funded_by_name" className="ta-input" list="fd-funded-by-options" defaultValue={fd.funded_by_name || fd.holder_name} /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Bank / Issuer"><input name="bank_name" className="ta-input" list="fd-bank-options" defaultValue={fd.bank_name} required /></Field>
          <Field label="Branch"><input name="branch" className="ta-input" defaultValue={fd.branch} required /></Field>
          <Field label="Deposit Number"><input name="fd_number" className="ta-input" defaultValue={fd.fd_number} required /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Deposit Date"><input name="deposit_date" type="date" className="ta-input" defaultValue={fd.deposit_date} /></Field>
          <Field label="Maturity Date"><input name="maturity_date" type="date" className="ta-input" defaultValue={fd.maturity_date} /></Field>
          <Field label="Principal Amount"><input name="principal" className="ta-input" defaultValue={fd.principal} /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Interest Rate (%)"><input name="interest_rate" className="ta-input" defaultValue={fd.interest_rate} /></Field>
          <Field label="Payout Type">
            <select name="payout_type" className="ta-input" defaultValue={fd.payout_type || "cumulative"}>
              {PAYOUT_OPTIONS.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Funding Type">
            <select name="funding_type" className="ta-input" defaultValue={fd.funding_type || "self"}>
              {FUNDING_OPTIONS.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Joint Account?">
            <select name="is_joint_account" className="ta-input" defaultValue={String(fd.is_joint_account || 0)}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </Field>
          <Field label="Payment Mode">
            <select name="payment_mode" className="ta-input" defaultValue={fd.payment_mode || "bank_transfer"}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
            </select>
          </Field>
          <Field label="Linked Loan">
            <select name="linked_loan_id" className="ta-input" defaultValue={fd.linked_loan_id || ""}>
              <option value="">None</option>
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.bank_name} | {loan.account_number} | {loan.interest_rate}%
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Reserved For"><input name="reserved_for" className="ta-input" list="fd-reserved-options" defaultValue={fd.reserved_for || ""} /></Field>
          <Field label="Incentive %"><input name="incentive_percentage" className="ta-input" defaultValue={fd.incentive_percentage || 0} /></Field>
          <Field label="Incentive Received"><input name="incentive_received" className="ta-input" defaultValue={fd.incentive_received || 0} /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Certificate Received">
            <select name="certificate_received" className="ta-input" defaultValue={String(fd.certificate_received || 0)}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </Field>
          <Field label="Certificate Received Date"><input name="certificate_received_date" type="date" className="ta-input" defaultValue={fd.certificate_received_date || dayjs().format("YYYY-MM-DD")} /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Raised By (Bank/RM Name)"><input name="raised_by_name" className="ta-input" list="fd-raised-by-options" defaultValue={fd.raised_by_name || ""} /></Field>
          <Field label="Raised By Contact"><input name="raised_by_contact" className="ta-input" defaultValue={fd.raised_by_contact || ""} /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Raised Under Name"><input name="raised_under_name" className="ta-input" list="fd-raised-under-options" defaultValue={fd.raised_under_name || ""} /></Field>
          <Field label="Nominee Name"><input name="nominee_name" className="ta-input" list="fd-nominee-options" defaultValue={fd.nominee_name || ""} /></Field>
        </div>

        <Field label="Remarks"><textarea name="remarks" className="ta-input" rows={3} defaultValue={fd.remarks || fd.notes || ""} /></Field>

        <button className="ta-btn" type="submit">Update Deposit</button>

        <datalist id="fd-holder-options">{holderSuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-funded-by-options">{fundedBySuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-bank-options">{bankSuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-nominee-options">{nomineeSuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-raised-by-options">{raisedBySuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-raised-under-options">{raisedUnderSuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-reserved-options">{reservedForSuggestions.map((x) => <option key={x} value={x} />)}</datalist>
      </form>

      <div className="ta-card p-4">
        <h2 className="text-lg font-semibold">Renewal History</h2>
        {renewals.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No renewal history for this deposit.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="ta-table min-w-full">
              <thead><tr><th>Renewal Date</th><th>New Deposit</th><th>Principal</th><th>Extra Added</th></tr></thead>
              <tbody>
                {renewals.map((r) => (
                  <tr key={r.id}>
                    <td>{r.deposit_date}</td>
                    <td>{r.fd_number}</td>
                    <td>{formatCurrency(r.principal)}</td>
                    <td>{formatCurrency(r.extra_amount_added || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
