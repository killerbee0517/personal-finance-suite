import type { ReactNode } from "react";
import { saveRDAction } from "@/app/actions/data";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default function RDNewPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Add RD</h1>
      <form action={saveRDAction} className="ta-card space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Holder Name"><input name="holder_name" className="ta-input" defaultValue="Owner" /></Field>
          <Field label="Bank Name"><input name="bank_name" className="ta-input" /></Field>
          <Field label="Branch"><input name="branch" className="ta-input" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="RD Number"><input name="rd_number" className="ta-input" /></Field>
          <Field label="Start Date"><input name="start_date" type="date" className="ta-input" defaultValue="2025-01-01" /></Field>
          <Field label="Maturity Date"><input name="maturity_date" type="date" className="ta-input" defaultValue="2027-01-01" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Monthly Installment"><input name="monthly_installment" className="ta-input" defaultValue="10000" /></Field>
          <Field label="Total Installments"><input name="total_installments" className="ta-input" defaultValue="24" /></Field>
          <Field label="Installments Paid"><input name="installments_paid" className="ta-input" defaultValue="0" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Interest Rate (%)"><input name="interest_rate" className="ta-input" defaultValue="7" /></Field>
          <Field label="Status"><input name="status" className="ta-input" defaultValue="active" /></Field>
          <Field label="Reserved For"><input name="reserved_for" className="ta-input" /></Field>
        </div>
        <Field label="Notes"><textarea name="notes" className="ta-input" rows={3} /></Field>
        <button className="ta-btn" type="submit">Save RD</button>
      </form>
    </div>
  );
}
