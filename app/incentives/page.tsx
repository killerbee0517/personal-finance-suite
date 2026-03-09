import Link from "next/link";
import dayjs from "dayjs";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function IncentivesPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const all = await repo.listIncentives();
  const status = (await searchParams)?.status || "pending";
  const list = all.filter((i) => i.status === status);

  const totalExpected = all.reduce((s, i) => s + i.expected_amount, 0);
  const totalReceived = all.reduce((s, i) => s + i.received_amount, 0);
  const totalPending = all.reduce((s, i) => s + i.pending_amount, 0);
  const overdueCount = all.filter((i) => i.pending_amount > 0 && dayjs(i.expected_date).isBefore(dayjs(), "day")).length;

  return <div className="space-y-5"><h1 className="text-2xl font-bold">Incentive Tracker</h1>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4"><div className="ta-card p-4"><p className="text-xs text-slate-500">Total Expected</p><p className="text-xl font-bold">{formatCurrency(totalExpected)}</p></div><div className="ta-card p-4"><p className="text-xs text-slate-500">Total Received</p><p className="text-xl font-bold">{formatCurrency(totalReceived)}</p></div><div className="ta-card p-4"><p className="text-xs text-slate-500">Total Pending</p><p className="text-xl font-bold">{formatCurrency(totalPending)}</p></div><div className="ta-card p-4"><p className="text-xs text-slate-500">Overdue Count</p><p className="text-xl font-bold">{overdueCount}</p></div></div>
    <div className="flex gap-2">{["pending","partial","received","overdue"].map((s)=><Link key={s} href={`/incentives?status=${s}`} className={status===s?"ta-btn":"ta-btn-outline"}>{s}</Link>)}</div>
    <div className="ta-card overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Bank</th><th>Expected</th><th>Received</th><th>Pending</th><th>Expected Date</th><th>Delay</th><th>FD</th></tr></thead><tbody>{list.map((i)=><tr key={i.id}><td>{i.bank_name}</td><td>{formatCurrency(i.expected_amount)}</td><td>{formatCurrency(i.received_amount)}</td><td>{formatCurrency(i.pending_amount)}</td><td>{i.expected_date}</td><td>{i.delay_days}</td><td>{i.fd_id}</td></tr>)}</tbody></table></div>
  </div>;
}
