import Link from "next/link";
import dayjs from "dayjs";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function BondsPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const all = await repo.listBonds();
  const coupons = await repo.listBondCoupons();
  const filter = (await searchParams)?.filter || "active";
  const list = all.filter((b) => filter === "active" ? b.status === "active" : filter === "maturing" ? dayjs(b.maturity_date).diff(dayjs(), "day") <= 120 : coupons.some((c)=>c.bond_id===b.id && c.expected_amount>c.received_amount && dayjs(c.due_date).diff(dayjs(),"day")<=15));

  return <div className="space-y-5"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Corporate Bonds</h1><Link href="/bonds/new" className="ta-btn">Add Bond</Link></div>
    <div className="flex gap-2"><Link href="/bonds?filter=active" className={filter==="active"?"ta-btn":"ta-btn-outline"}>Active</Link><Link href="/bonds?filter=maturing" className={filter==="maturing"?"ta-btn":"ta-btn-outline"}>Maturing Soon</Link><Link href="/bonds?filter=coupon_due" className={filter==="coupon_due"?"ta-btn":"ta-btn-outline"}>Coupon Due</Link></div>
    <div className="ta-card overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Platform/Issuer</th><th>Invested</th><th>Coupon</th><th>Maturity</th><th>Pending Coupon</th><th /></tr></thead><tbody>{list.map((b)=>{const pending=coupons.filter((c)=>c.bond_id===b.id).reduce((s,c)=>s+Math.max(c.expected_amount-c.received_amount,0),0);return <tr key={b.id}><td>{b.platform} | {b.issuer_name}</td><td>{formatCurrency(b.principal_invested)}</td><td>{b.coupon_rate}%</td><td>{b.maturity_date} ({dayjs(b.maturity_date).diff(dayjs(),"day")}d)</td><td>{formatCurrency(pending)}</td><td><Link href={`/bonds/${b.id}`} className="ta-btn-outline">View</Link></td></tr>;})}</tbody></table></div></div>;
}
