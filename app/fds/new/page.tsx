import type { ReactNode } from "react";
import dayjs from "dayjs";
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
            <input name="holder_name" className="ta-input" defaultValue="Owner" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Bank / Issuer"><input name="bank_name" className="ta-input" /></Field>
          <Field label="Branch"><input name="branch" className="ta-input" /></Field>
          <Field label="Deposit Number"><input name="fd_number" className="ta-input" /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Deposit Date"><input name="deposit_date" type="date" className="ta-input" defaultValue={dayjs().format("YYYY-MM-DD")} /></Field>
          <Field label="Maturity Date"><input name="maturity_date" type="date" className="ta-input" defaultValue={dayjs().add(1, "year").format("YYYY-MM-DD")} /></Field>
          <Field label="Principal Amount"><input name="principal" className="ta-input" defaultValue="100000" /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Interest Rate (%)"><input name="interest_rate" className="ta-input" defaultValue="7.2" /></Field>
          <Field label="Payout Type"><input name="payout_type" className="ta-input" defaultValue="Cumulative" /></Field>
          <Field label="Funding Type"><input name="funding_type" className="ta-input" defaultValue="Self" /></Field>
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
          <Field label="Renewal From Deposit ID"><input name="renewal_from_fd_id" className="ta-input" /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Linked Loan ID"><input name="linked_loan_id" className="ta-input" /></Field>
          <Field label="Reserved For"><input name="reserved_for" className="ta-input" /></Field>
          <Field label="Incentive %"><input name="incentive_percentage" className="ta-input" defaultValue="0" /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Incentive Received"><input name="incentive_received" className="ta-input" defaultValue="0" /></Field>
          <Field label="Certificate Received">
            <select name="certificate_received" className="ta-input" defaultValue="0">
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Certificate Received Date"><input name="certificate_received_date" type="date" className="ta-input" defaultValue={dayjs().format("YYYY-MM-DD")} /></Field>
          <Field label="Raised By (Bank/RM Name)"><input name="raised_by_name" className="ta-input" /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Raised By Contact"><input name="raised_by_contact" className="ta-input" /></Field>
          <Field label="Raised Under Name"><input name="raised_under_name" className="ta-input" /></Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nominee Name"><input name="nominee_name" className="ta-input" /></Field>
          <Field label="Remarks"><textarea name="remarks" className="ta-input" rows={2} /></Field>
        </div>

        <Field label="Notes"><textarea name="notes" className="ta-input" rows={3} /></Field>

        <button className="ta-btn" type="submit">Save Deposit</button>
      </form>
    </div>
  );
}
