import type { ReactNode } from "react";
import { saveFDAction } from "@/app/actions/data";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default function FDNewPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Add Deposit</h1>
      <form action={saveFDAction} className="ta-card space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Instrument Type">
            <select name="instrument_type" className="ta-input" defaultValue="fd">
              <option value="fd">FD</option>
              <option value="ncd">NCD</option>
              <option value="subordinate_debt">Subordinate Debt</option>
            </select>
          </Field>
          <Field label="Holder Name">
            <input name="holder_name" className="ta-input" defaultValue="Owner" />
          </Field>
          <Field label="Bank / Issuer">
            <input name="bank_name" className="ta-input" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Branch">
            <input name="branch" className="ta-input" />
          </Field>
          <Field label="Deposit Number">
            <input name="fd_number" className="ta-input" />
          </Field>
          <Field label="Renewal From Deposit ID">
            <input name="renewal_from_fd_id" className="ta-input" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Deposit Date">
            <input name="deposit_date" type="date" className="ta-input" defaultValue="2026-01-01" />
          </Field>
          <Field label="Maturity Date">
            <input name="maturity_date" type="date" className="ta-input" defaultValue="2027-01-01" />
          </Field>
          <Field label="Principal Amount">
            <input name="principal" className="ta-input" defaultValue="100000" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Interest Rate (%)">
            <input name="interest_rate" className="ta-input" defaultValue="7.2" />
          </Field>
          <Field label="Payout Type">
            <input name="payout_type" className="ta-input" defaultValue="Cumulative" />
          </Field>
          <Field label="Status">
            <input name="status" className="ta-input" defaultValue="active" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Funding Type">
            <input name="funding_type" className="ta-input" defaultValue="Self" />
          </Field>
          <Field label="Linked Loan ID">
            <input name="linked_loan_id" className="ta-input" />
          </Field>
          <Field label="Reserved For">
            <input name="reserved_for" className="ta-input" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Incentive Expected">
            <input name="incentive_expected" className="ta-input" defaultValue="0" />
          </Field>
          <Field label="Incentive Received">
            <input name="incentive_received" className="ta-input" defaultValue="0" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Certificate Received">
            <select name="certificate_received" className="ta-input" defaultValue="0">
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </Field>
          <Field label="Certificate Received Date">
            <input name="certificate_received_date" type="date" className="ta-input" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Raised By (Bank/RM Name)">
            <input name="raised_by_name" className="ta-input" />
          </Field>
          <Field label="Raised By Contact">
            <input name="raised_by_contact" className="ta-input" />
          </Field>
        </div>

        <Field label="Remarks">
          <textarea name="remarks" className="ta-input" rows={2} />
        </Field>
        <Field label="Notes">
          <textarea name="notes" className="ta-input" rows={3} />
        </Field>

        <button className="ta-btn" type="submit">Save Deposit</button>
      </form>
    </div>
  );
}
