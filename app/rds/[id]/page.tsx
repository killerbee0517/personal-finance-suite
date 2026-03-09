import { notFound } from "next/navigation";
import { saveRDAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function RDDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const rd = await repo.getRD(Number((await params).id));
  if (!rd) return notFound();

  return <div className="space-y-5"><h1 className="text-2xl font-bold">RD Detail</h1><form action={saveRDAction} className="ta-card space-y-4 p-5">
    <input type="hidden" name="id" value={rd.id} />
    <div className="grid gap-4 md:grid-cols-3"><input name="holder_name" className="ta-input" defaultValue={rd.holder_name}/><input name="bank_name" className="ta-input" defaultValue={rd.bank_name}/><input name="branch" className="ta-input" defaultValue={rd.branch}/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="rd_number" className="ta-input" defaultValue={rd.rd_number}/><input name="start_date" className="ta-input" defaultValue={rd.start_date}/><input name="maturity_date" className="ta-input" defaultValue={rd.maturity_date}/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="monthly_installment" className="ta-input" defaultValue={rd.monthly_installment}/><input name="total_installments" className="ta-input" defaultValue={rd.total_installments}/><input name="installments_paid" className="ta-input" defaultValue={rd.installments_paid}/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="interest_rate" className="ta-input" defaultValue={rd.interest_rate}/><input name="status" className="ta-input" defaultValue={rd.status}/><input name="reserved_for" className="ta-input" defaultValue={rd.reserved_for || ""}/></div>
    <textarea name="notes" className="ta-input" rows={3} defaultValue={rd.notes || ""}/><button type="submit" className="ta-btn">Update RD</button>
  </form></div>;
}
