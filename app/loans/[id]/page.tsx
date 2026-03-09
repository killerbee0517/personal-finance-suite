import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { saveLoanAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
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

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const loan = await repo.getLoan(Number((await params).id));
  if (!loan) return notFound();

  const links = (await repo.listLinks()).filter((l) => l.loan_id === loan.id);
  const fds = await repo.listFDs();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Loan Detail</h1>
      <div className="ta-card p-4 text-sm">{loan.bank_name} | {loan.loan_type} | Outstanding {formatCurrency(loan.outstanding_principal)}</div>

      <form action={saveLoanAction} className="ta-card space-y-4 p-5">
        <input type="hidden" name="id" value={loan.id} />

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Loan Type"><input name="loan_type" className="ta-input" defaultValue={loan.loan_type} /></Field>
          <Field label="Holder Name"><input name="holder_name" className="ta-input" defaultValue={loan.holder_name} /></Field>
          <Field label="Bank Name"><input name="bank_name" className="ta-input" defaultValue={loan.bank_name} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Account Number"><input name="account_number" className="ta-input" defaultValue={loan.account_number} /></Field>
          <Field label="Start Date"><input name="start_date" type="date" className="ta-input" defaultValue={loan.start_date} /></Field>
          <Field label="End Date"><input name="end_date" type="date" className="ta-input" defaultValue={loan.end_date} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Principal Amount"><input name="principal_amount" className="ta-input" defaultValue={loan.principal_amount} /></Field>
          <Field label="Interest Rate (%)"><input name="interest_rate" className="ta-input" defaultValue={loan.interest_rate} /></Field>
          <Field label="Repayment Type"><input name="repayment_type" className="ta-input" defaultValue={loan.repayment_type} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="EMI Amount"><input name="emi_amount" className="ta-input" defaultValue={loan.emi_amount || 0} /></Field>
          <Field label="Outstanding Principal"><input name="outstanding_principal" className="ta-input" defaultValue={loan.outstanding_principal} /></Field>
          <Field label="Bullet Closure Amount"><input name="bullet_closure_amount" className="ta-input" defaultValue={loan.bullet_closure_amount || 0} /></Field>
        </div>

        <Field label="Status"><input name="status" className="ta-input" defaultValue={loan.status} /></Field>
        <Field label="Notes"><textarea name="notes" className="ta-input" rows={3} defaultValue={loan.notes || ""} /></Field>

        <button type="submit" className="ta-btn">Update Loan</button>
      </form>

      <div className="ta-card p-4 text-sm">
        <p className="mb-2 font-semibold">Linked FDs</p>
        {links.length === 0 ? "No links" : links.map((l) => <p key={l.id}>{fds.find((f) => f.id === l.fd_id)?.fd_number} | {formatCurrency(l.linked_amount)}</p>)}
      </div>
    </div>
  );
}
