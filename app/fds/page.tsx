import Link from "next/link";
import dayjs from "dayjs";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { estimateFDCurrentValue, potentialReturnPercent } from "@/lib/returns";
import { repo } from "@/lib/services";

export default async function FDsPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const all = await repo.listFDs();
  const filter = (await searchParams)?.filter || "all";

  const fds = all.filter((fd) => {
    if (filter === "active") return fd.status === "active";
    if (filter === "maturing") return dayjs(fd.maturity_date).diff(dayjs(), "day") <= 30;
    if (filter === "loan") return fd.funding_type.toLowerCase().includes("loan") || !!fd.linked_loan_id;
    if (filter === "reserved") return !!fd.reserved_for;
    return true;
  });

  const today = dayjs().format("YYYY-MM-DD");
  const totalCurrent = fds.reduce((s, fd) => s + estimateFDCurrentValue(fd, today), 0);
  const totalProjected = fds.reduce((s, fd) => s + Math.max(fd.maturity_value_expected || fd.principal, fd.principal), 0);
  const potentialReturn = potentialReturnPercent(totalCurrent, totalProjected);
  const activeCount = fds.filter((fd) => fd.status === "active").length;
  const maturing30 = fds.filter((fd) => dayjs(fd.maturity_date).diff(dayjs(), "day") <= 30).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Deposit Tracker</h1>
        <Link href="/fds/new" className="ta-btn">Add Deposit</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {[["all","All"],["active","Active"],["maturing","Maturing Soon"],["loan","Loan-Backed"],["reserved","Reserved"]].map(([k,l])=> <Link key={k} href={`/fds?filter=${k}`} className={filter===k?"ta-btn":"ta-btn-outline"}>{l}</Link>)}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="ta-card p-4"><p className="text-xs text-slate-500">Active Deposits</p><p className="text-xl font-bold">{activeCount}</p></div>
        <div className="ta-card p-4"><p className="text-xs text-slate-500">Maturing in 30 days</p><p className="text-xl font-bold">{maturing30}</p></div>
        <div className="ta-card p-4"><p className="text-xs text-slate-500">FD Potential Return</p><p className="text-xl font-bold">{Number.isFinite(potentialReturn) ? `${(potentialReturn as number).toFixed(2)}%` : "-"}</p></div>
      </div>
      <div className="ta-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="ta-table min-w-full">
          <thead><tr><th>Type</th><th>Owner</th><th>Institution</th><th>Bank / Issuer</th><th>Raised By</th><th>Principal</th><th>Maturity</th><th>Joint</th><th /></tr></thead>
          <tbody>
            {fds.map((fd)=><tr key={fd.id}><td>{(fd.instrument_type || "fd").toUpperCase()}</td><td>{fd.holder_name || "-"}</td><td>{(fd.institution_type || "bank").replaceAll("_"," ")}</td><td>{fd.bank_name}{fd.reserved_for?" | Reserved":""}{fd.linked_loan_id?" | Loan":""}</td><td>{fd.raised_by_name || fd.raised_under_name || "-"}</td><td>{formatCurrency(fd.principal)}</td><td>{fd.maturity_date}</td><td>{fd.is_joint_account ? "Yes" : "No"}</td><td><div className="flex gap-2"><Link href={`/fds/${fd.id}`} className="ta-btn-outline">View</Link><Link href={`/fds/${fd.id}/renew`} className="ta-btn-outline">Renew</Link></div></td></tr>)}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
