import Link from "next/link";
import dayjs from "dayjs";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function LoansPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const all = await repo.listLoans();
  const filter = (await searchParams)?.filter || "active";
  const loans = filter === "due" ? all.filter((l) => dayjs(l.end_date).diff(dayjs(), "day") <= 60) : all.filter((l) => l.status === "active");
  const links = await repo.listLinks();

  return <div className="space-y-5"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Loan Tracker</h1><Link className="ta-btn" href="/loans/new">Add Loan</Link></div>
    <div className="flex gap-2"><Link className={filter==="active"?"ta-btn":"ta-btn-outline"} href="/loans?filter=active">Active</Link><Link className={filter==="due"?"ta-btn":"ta-btn-outline"} href="/loans?filter=due">Due Soon</Link></div>
    <div className="ta-card overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Lender</th><th>Outstanding</th><th>Rate</th><th>Due</th><th>Linked FDs</th><th /></tr></thead><tbody>{loans.map((loan)=><tr key={loan.id}><td>{loan.bank_name} | {loan.loan_type}</td><td>{formatCurrency(loan.outstanding_principal)}</td><td>{loan.interest_rate}%</td><td>{loan.end_date} ({dayjs(loan.end_date).diff(dayjs(),"day")}d)</td><td>{links.filter((l)=>l.loan_id===loan.id).length}</td><td><Link href={`/loans/${loan.id}`} className="ta-btn-outline">View</Link></td></tr>)}</tbody></table></div>
  </div>;
}
