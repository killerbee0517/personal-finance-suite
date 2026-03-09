import { notFound } from "next/navigation";
import { saveLoanAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

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
        <div className="grid gap-4 md:grid-cols-3"><input name="loan_type" className="ta-input" defaultValue={loan.loan_type}/><input name="holder_name" className="ta-input" defaultValue={loan.holder_name}/><input name="bank_name" className="ta-input" defaultValue={loan.bank_name}/></div>
        <div className="grid gap-4 md:grid-cols-3"><input name="account_number" className="ta-input" defaultValue={loan.account_number}/><input name="start_date" className="ta-input" defaultValue={loan.start_date}/><input name="end_date" className="ta-input" defaultValue={loan.end_date}/></div>
        <div className="grid gap-4 md:grid-cols-3"><input name="principal_amount" className="ta-input" defaultValue={loan.principal_amount}/><input name="interest_rate" className="ta-input" defaultValue={loan.interest_rate}/><input name="repayment_type" className="ta-input" defaultValue={loan.repayment_type}/></div>
        <div className="grid gap-4 md:grid-cols-3"><input name="emi_amount" className="ta-input" defaultValue={loan.emi_amount || 0}/><input name="outstanding_principal" className="ta-input" defaultValue={loan.outstanding_principal}/><input name="bullet_closure_amount" className="ta-input" defaultValue={loan.bullet_closure_amount || 0}/></div>
        <input name="status" className="ta-input" defaultValue={loan.status}/><textarea name="notes" className="ta-input" rows={3} defaultValue={loan.notes || ""}/><button type="submit" className="ta-btn">Update Loan</button>
      </form>
      <div className="ta-card p-4 text-sm"><p className="mb-2 font-semibold">Linked FDs</p>{links.length===0?"No links":links.map((l)=><p key={l.id}>{fds.find((f)=>f.id===l.fd_id)?.fd_number} | {formatCurrency(l.linked_amount)}</p>)}</div>
    </div>
  );
}
