import type { ReactNode } from "react";
import { saveBondAction } from "@/app/actions/data";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default function BondNewPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Add Bond</h1>
      <form action={saveBondAction} className="ta-card space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Platform"><input name="platform" className="ta-input" defaultValue="GoldenPi" /></Field>
          <Field label="Issuer Name"><input name="issuer_name" className="ta-input" /></Field>
          <Field label="Bond Name"><input name="bond_name" className="ta-input" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="ISIN"><input name="isin" className="ta-input" /></Field>
          <Field label="Holder Name"><input name="holder_name" className="ta-input" defaultValue="Owner" /></Field>
          <Field label="Status"><input name="status" className="ta-input" defaultValue="active" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Investment Date"><input name="investment_date" type="date" className="ta-input" defaultValue="2026-01-01" /></Field>
          <Field label="Maturity Date"><input name="maturity_date" type="date" className="ta-input" defaultValue="2028-01-01" /></Field>
          <Field label="Principal Invested"><input name="principal_invested" className="ta-input" defaultValue="500000" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Face Value"><input name="face_value" className="ta-input" defaultValue="1000" /></Field>
          <Field label="Coupon Rate (%)"><input name="coupon_rate" className="ta-input" defaultValue="10.5" /></Field>
          <Field label="Units"><input name="units" className="ta-input" defaultValue="500" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Payout Frequency"><input name="payout_frequency" className="ta-input" defaultValue="monthly" /></Field>
          <Field label="Payout Day"><input name="payout_day" className="ta-input" defaultValue="7" /></Field>
        </div>
        <Field label="Notes"><textarea name="notes" className="ta-input" rows={3} /></Field>
        <button className="ta-btn" type="submit">Save Bond</button>
      </form>
    </div>
  );
}
