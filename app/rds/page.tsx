import Link from "next/link";
import dayjs from "dayjs";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function RDsPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const all = await repo.listRDs();
  const filter = (await searchParams)?.filter || "all";
  const rds = all.filter((rd) => filter === "active" ? rd.status === "active" : filter === "maturing" ? dayjs(rd.maturity_date).diff(dayjs(), "day") <= 90 : filter === "reserved" ? !!rd.reserved_for : true);

  return <div className="space-y-5"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold">RD Tracker</h1><Link href="/rds/new" className="ta-btn">Add RD</Link></div>
    <div className="flex gap-2">{[["all","All"],["active","Active"],["maturing","Maturing Soon"],["reserved","Reserved"]].map(([k,l])=><Link key={k} href={`/rds?filter=${k}`} className={filter===k?"ta-btn":"ta-btn-outline"}>{l}</Link>)}</div>
    <div className="ta-card overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Bank</th><th>Monthly</th><th>Progress</th><th>Maturity</th><th>Expected</th><th /></tr></thead><tbody>{rds.map((rd)=><tr key={rd.id}><td>{rd.bank_name} | {rd.rd_number}</td><td>{formatCurrency(rd.monthly_installment)}</td><td>{rd.installments_paid}/{rd.total_installments}</td><td>{rd.maturity_date} ({dayjs(rd.maturity_date).diff(dayjs(),"day")}d)</td><td>{formatCurrency(rd.maturity_value_expected)}</td><td><Link href={`/rds/${rd.id}`} className="ta-btn-outline">View</Link></td></tr>)}</tbody></table></div>
  </div>;
}
