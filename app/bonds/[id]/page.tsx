import { notFound } from "next/navigation";
import { saveBondAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function BondDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const bond = await repo.getBond(Number((await params).id));
  if (!bond) return notFound();
  const coupons = await repo.listBondCouponsByBond(bond.id);

  return <div className="space-y-5"><h1 className="text-2xl font-bold">Bond Detail</h1>
    <div className="ta-card p-4 text-sm">{bond.platform} | {bond.issuer_name} | {formatCurrency(bond.principal_invested)} | {bond.coupon_rate}%</div>
    <form action={saveBondAction} className="ta-card space-y-4 p-5">
      <input type="hidden" name="id" value={bond.id} />
      <div className="grid gap-4 md:grid-cols-3"><input name="platform" className="ta-input" defaultValue={bond.platform}/><input name="issuer_name" className="ta-input" defaultValue={bond.issuer_name}/><input name="bond_name" className="ta-input" defaultValue={bond.bond_name}/></div>
      <div className="grid gap-4 md:grid-cols-3"><input name="isin" className="ta-input" defaultValue={bond.isin}/><input name="holder_name" className="ta-input" defaultValue={bond.holder_name}/><input name="status" className="ta-input" defaultValue={bond.status}/></div>
      <div className="grid gap-4 md:grid-cols-3"><input name="investment_date" className="ta-input" defaultValue={bond.investment_date}/><input name="maturity_date" className="ta-input" defaultValue={bond.maturity_date}/><input name="principal_invested" className="ta-input" defaultValue={bond.principal_invested}/></div>
      <div className="grid gap-4 md:grid-cols-3"><input name="face_value" className="ta-input" defaultValue={bond.face_value}/><input name="coupon_rate" className="ta-input" defaultValue={bond.coupon_rate}/><input name="units" className="ta-input" defaultValue={bond.units}/></div>
      <div className="grid gap-4 md:grid-cols-2"><input name="payout_frequency" className="ta-input" defaultValue={bond.payout_frequency}/><input name="payout_day" className="ta-input" defaultValue={bond.payout_day}/></div>
      <textarea name="notes" className="ta-input" rows={3} defaultValue={bond.notes || ""}/><button type="submit" className="ta-btn">Update Bond</button>
    </form>
    <div className="ta-card overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Due Date</th><th>Expected</th><th>Received</th><th>Status</th></tr></thead><tbody>{coupons.map((c)=><tr key={c.id}><td>{c.due_date}</td><td>{formatCurrency(c.expected_amount)}</td><td>{formatCurrency(c.received_amount)}</td><td>{c.status}</td></tr>)}</tbody></table></div>
  </div>;
}
