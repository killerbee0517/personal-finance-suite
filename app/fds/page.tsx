import Link from "next/link";
import dayjs from "dayjs";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deposit Tracker</h1>
        <Link href="/fds/new" className="ta-btn">Add Deposit</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {[["all","All"],["active","Active"],["maturing","Maturing Soon"],["loan","Loan-Backed"],["reserved","Reserved"]].map(([k,l])=> <Link key={k} href={`/fds?filter=${k}`} className={filter===k?"ta-btn":"ta-btn-outline"}>{l}</Link>)}
      </div>
      <div className="ta-card overflow-x-auto">
        <table className="ta-table min-w-full">
          <thead><tr><th>Type</th><th>Institution</th><th>Bank / Issuer</th><th>Principal</th><th>Maturity</th><th>Joint</th><th>Payment</th><th>Incentive %</th><th>Pending Incentive</th><th>Certificate</th><th /></tr></thead>
          <tbody>
            {fds.map((fd)=><tr key={fd.id}><td>{(fd.instrument_type || "fd").toUpperCase()}</td><td>{(fd.institution_type || "bank").replaceAll("_"," ")}</td><td>{fd.bank_name}{fd.reserved_for?" | Reserved":""}{fd.linked_loan_id?" | Loan":""}</td><td>{formatCurrency(fd.principal)}</td><td>{fd.maturity_date} ({dayjs(fd.maturity_date).diff(dayjs(),"day")}d)</td><td>{fd.is_joint_account ? "Yes" : "No"}</td><td>{fd.payment_mode || "-"}</td><td>{fd.incentive_percentage || 0}%</td><td>{formatCurrency((fd.incentive_expected||0)-(fd.incentive_received||0))}</td><td>{fd.certificate_received ? `Yes${fd.certificate_received_date ? ` (${fd.certificate_received_date})` : ""}` : "No"}</td><td><Link href={`/fds/${fd.id}`} className="ta-btn-outline">View</Link></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
