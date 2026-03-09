import type { ReactNode } from "react";
import { saveLoanAction } from "@/app/actions/data";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default function LoanNewPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Add Loan</h1>
      <form action={saveLoanAction} className="ta-card space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Loan Type"><input name="loan_type" className="ta-input" defaultValue="LAP" /></Field>
          <Field label="Holder Name"><input name="holder_name" className="ta-input" defaultValue="Owner" /></Field>
          <Field label="Bank Name"><input name="bank_name" className="ta-input" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Account Number"><input name="account_number" className="ta-input" /></Field>
          <Field label="Start Date"><input name="start_date" type="date" className="ta-input" defaultValue="2026-01-01" /></Field>
          <Field label="End Date"><input name="end_date" type="date" className="ta-input" defaultValue="2028-01-01" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Principal Amount"><input name="principal_amount" className="ta-input" defaultValue="1000000" /></Field>
          <Field label="Interest Rate (%)"><input name="interest_rate" className="ta-input" defaultValue="10.2" /></Field>
          <Field label="Repayment Type"><input name="repayment_type" className="ta-input" defaultValue="EMI" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="EMI Amount"><input name="emi_amount" className="ta-input" defaultValue="0" /></Field>
          <Field label="Outstanding Principal"><input name="outstanding_principal" className="ta-input" defaultValue="1000000" /></Field>
          <Field label="Bullet Closure Amount"><input name="bullet_closure_amount" className="ta-input" defaultValue="0" /></Field>
        </div>
        <Field label="Status"><input name="status" className="ta-input" defaultValue="active" /></Field>
        <Field label="Notes"><textarea name="notes" className="ta-input" rows={3} /></Field>
        <button type="submit" className="ta-btn">Save Loan</button>
      </form>
    </div>
  );
}
