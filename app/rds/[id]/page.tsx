import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { saveRDAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default async function RDDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const rd = await repo.getRD(Number((await params).id));
  if (!rd) return notFound();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">RD Detail</h1>
      <form action={saveRDAction} className="ta-card space-y-4 p-5">
        <input type="hidden" name="id" value={rd.id} />
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Holder Name"><input name="holder_name" className="ta-input" defaultValue={rd.holder_name} /></Field>
          <Field label="Bank Name"><input name="bank_name" className="ta-input" defaultValue={rd.bank_name} /></Field>
          <Field label="Branch"><input name="branch" className="ta-input" defaultValue={rd.branch} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="RD Number"><input name="rd_number" className="ta-input" defaultValue={rd.rd_number} /></Field>
          <Field label="Start Date"><input name="start_date" type="date" className="ta-input" defaultValue={rd.start_date} /></Field>
          <Field label="Maturity Date"><input name="maturity_date" type="date" className="ta-input" defaultValue={rd.maturity_date} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Monthly Installment"><input name="monthly_installment" className="ta-input" defaultValue={rd.monthly_installment} /></Field>
          <Field label="Total Installments"><input name="total_installments" className="ta-input" defaultValue={rd.total_installments} /></Field>
          <Field label="Installments Paid"><input name="installments_paid" className="ta-input" defaultValue={rd.installments_paid} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Interest Rate (%)"><input name="interest_rate" className="ta-input" defaultValue={rd.interest_rate} /></Field>
          <Field label="Status"><input name="status" className="ta-input" defaultValue={rd.status} /></Field>
          <Field label="Reserved For"><input name="reserved_for" className="ta-input" defaultValue={rd.reserved_for || ""} /></Field>
        </div>
        <Field label="Notes"><textarea name="notes" className="ta-input" rows={3} defaultValue={rd.notes || ""} /></Field>
        <button type="submit" className="ta-btn">Update RD</button>
      </form>
    </div>
  );
}
