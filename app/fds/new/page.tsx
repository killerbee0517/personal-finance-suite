import type { ReactNode } from "react";
import dayjs from "dayjs";
import { DbRequired } from "@/components/DbRequired";
import { saveFDAction } from "@/app/actions/data";
import { ensureInitialized } from "@/lib/init";
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

export default async function FDNewPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const error = (await searchParams)?.error;

  const [fds, loans] = await Promise.all([repo.listFDs(), repo.listLoans()]);
  const holderSuggestions = unique(fds.map((x) => x.holder_name));
  const fundedBySuggestions = unique([...fds.map((x) => x.funded_by_name), ...holderSuggestions]);
  const bankSuggestions = unique(fds.map((x) => x.bank_name));
  const nomineeSuggestions = unique(fds.map((x) => x.nominee_name));
  const raisedBySuggestions = unique(fds.map((x) => x.raised_by_name));
  const raisedUnderSuggestions = unique(fds.map((x) => x.raised_under_name));
  const reservedForSuggestions = unique([...RESERVED_OPTIONS, ...fds.map((x) => x.reserved_for)]);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">Add Deposit</h1>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <form action={saveFDAction} className="ta-card space-y-4 p-5">
        <input type="hidden" name="status" value="active" />

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Deposit Type">
            <select name="instrument_type" className="ta-input" defaultValue="fd">
              <option value="fd">Fixed Deposit</option>
              <option value="ncd">NCD</option>
              <option value="subordinate_debt">Subordinate Debt</option>
            </select>
          </Field>
          <Field label="Institution Type">
            <select name="institution_type" className="ta-input" defaultValue="bank">
              <option value="bank">Bank</option>
              <option value="nbfc">NBFC</option>
              <option value="cooperative_society">Cooperative Society</option>
              <option value="nidhi">Nidhi</option>
            </select>
          </Field>
          <Field label="Holder Name">
            <input name="holder_name" className="ta-input" list="fd-holder-options" defaultValue="Owner" />
          </Field>
          <Field label="Funded By">
            <input name="funded_by_name" className="ta-input" list="fd-funded-by-options" defaultValue="Owner" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Bank / Issuer"><input name="bank_name" className="ta-input" list="fd-bank-options" required /></Field>
          <Field label="Branch"><input name="branch" className="ta-input" required /></Field>
          <Field label="Deposit Number"><input name="fd_number" className="ta-input" required /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Deposit Date"><input name="deposit_date" type="date" className="ta-input" defaultValue={dayjs().format("YYYY-MM-DD")} /></Field>
          <Field label="Maturity Date"><input name="maturity_date" type="date" className="ta-input" defaultValue={dayjs().add(1, "year").format("YYYY-MM-DD")} /></Field>
          <Field label="Principal Amount"><input name="principal" className="ta-input" defaultValue="100000" /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Interest Rate (%)"><input name="interest_rate" className="ta-input" defaultValue="7.2" /></Field>
          <Field label="Payout Type">
            <select name="payout_type" className="ta-input" defaultValue="cumulative">
              {PAYOUT_OPTIONS.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Funding Type">
            <select name="funding_type" className="ta-input" defaultValue="self">
              {FUNDING_OPTIONS.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Joint Account?">
            <select name="is_joint_account" className="ta-input" defaultValue="0">
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </Field>
          <Field label="Payment Mode">
            <select name="payment_mode" className="ta-input" defaultValue="bank_transfer">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
            </select>
          </Field>
          <Field label="Linked Loan">
            <select name="linked_loan_id" className="ta-input" defaultValue="">
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
          <Field label="Reserved For"><input name="reserved_for" className="ta-input" list="fd-reserved-options" /></Field>
          <Field label="Incentive %"><input name="incentive_percentage" className="ta-input" defaultValue="0" /></Field>
          <Field label="Incentive Received"><input name="incentive_received" className="ta-input" defaultValue="0" /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Certificate Received">
            <select name="certificate_received" className="ta-input" defaultValue="0">
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </Field>
          <Field label="Certificate Received Date"><input name="certificate_received_date" type="date" className="ta-input" defaultValue={dayjs().format("YYYY-MM-DD")} /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Raised By (Bank/RM Name)"><input name="raised_by_name" className="ta-input" list="fd-raised-by-options" /></Field>
          <Field label="Raised By Contact"><input name="raised_by_contact" className="ta-input" /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Raised Under Name"><input name="raised_under_name" className="ta-input" list="fd-raised-under-options" /></Field>
          <Field label="Nominee Name"><input name="nominee_name" className="ta-input" list="fd-nominee-options" /></Field>
        </div>

        <Field label="Remarks"><textarea name="remarks" className="ta-input" rows={3} /></Field>

        <button className="ta-btn" type="submit">Save Deposit</button>

        <datalist id="fd-holder-options">{holderSuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-funded-by-options">{fundedBySuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-bank-options">{bankSuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-nominee-options">{nomineeSuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-raised-by-options">{raisedBySuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-raised-under-options">{raisedUnderSuggestions.map((x) => <option key={x} value={x} />)}</datalist>
        <datalist id="fd-reserved-options">{reservedForSuggestions.map((x) => <option key={x} value={x} />)}</datalist>
      </form>
    </div>
  );
}
