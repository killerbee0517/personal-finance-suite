import Link from "next/link";
import dayjs from "dayjs";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { cagrPercent, estimateRDCurrentValue, potentialReturnPercent, rdProjectedBaseFromToday } from "@/lib/returns";
import { repo } from "@/lib/services";

export default async function RDsPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const all = await repo.listRDs();
  const filter = (await searchParams)?.filter || "all";
  const rds = all.filter((rd) => filter === "active" ? rd.status === "active" : filter === "maturing" ? dayjs(rd.maturity_date).diff(dayjs(), "day") <= 90 : filter === "reserved" ? !!rd.reserved_for : true);
  const today = dayjs().format("YYYY-MM-DD");
  const invested = rds.reduce((s, rd) => s + rd.monthly_installment * rd.installments_paid, 0);
  const current = rds.reduce((s, rd) => s + estimateRDCurrentValue(rd, today), 0);
  const projected = rds.reduce((s, rd) => s + Math.max(rd.maturity_value_expected || 0, rd.monthly_installment * rd.total_installments), 0);
  const projectedBase = rds.reduce((s, rd) => s + rdProjectedBaseFromToday(rd, today), 0);
  const firstStart = rds.map((rd) => rd.start_date).sort()[0];
  const rdCagr = firstStart ? cagrPercent(invested, current, firstStart, today) : null;
  const potentialReturn = potentialReturnPercent(projectedBase, projected);
  const activeCount = rds.filter((rd) => rd.status === "active").length;

  return <div className="space-y-5"><div className="flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">RD Tracker</h1><Link href="/rds/new" className="ta-btn">Add RD</Link></div>
    <div className="flex gap-2">{[["all","All"],["active","Active"],["maturing","Maturing Soon"],["reserved","Reserved"]].map(([k,l])=><Link key={k} href={`/rds?filter=${k}`} className={filter===k?"ta-btn":"ta-btn-outline"}>{l}</Link>)}</div>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="ta-card p-4"><p className="text-xs text-slate-500">Active RDs</p><p className="text-xl font-bold">{activeCount}</p></div>
      <div className="ta-card p-4"><p className="text-xs text-slate-500">RD CAGR (Actual)</p><p className="text-xl font-bold">{Number.isFinite(rdCagr) ? `${(rdCagr as number).toFixed(2)}%` : "-"}</p></div>
      <div className="ta-card p-4"><p className="text-xs text-slate-500">RD Potential Return</p><p className="text-xl font-bold">{Number.isFinite(potentialReturn) ? `${(potentialReturn as number).toFixed(2)}%` : "-"}</p></div>
    </div>
    <div className="ta-card overflow-hidden"><div className="overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Bank</th><th>Start Date</th><th>Monthly</th><th>Progress</th><th>Maturity</th><th>Expected</th><th /></tr></thead><tbody>{rds.map((rd)=><tr key={rd.id}><td>{rd.bank_name} | {rd.rd_number}</td><td>{rd.start_date}</td><td>{formatCurrency(rd.monthly_installment)}</td><td>{rd.installments_paid}/{rd.total_installments}</td><td>{rd.maturity_date}</td><td>{formatCurrency(rd.maturity_value_expected)}</td><td><Link href={`/rds/${rd.id}`} className="ta-btn-outline">View</Link></td></tr>)}</tbody></table></div></div>
  </div>;
}
