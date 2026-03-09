import dayjs from "dayjs";
import { savePPFAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function PPFPage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const ppf = await repo.listPPFAccounts();

  return <div className="space-y-5"><h1 className="text-2xl font-bold">PPF Tracker</h1>
    <form action={savePPFAction} className="ta-card space-y-4 p-5"><div className="grid gap-4 md:grid-cols-3"><input name="bank_name" className="ta-input" placeholder="Bank"/><input name="account_number" className="ta-input" placeholder="Account"/><input name="holder_name" className="ta-input" defaultValue="Owner"/></div><div className="grid gap-4 md:grid-cols-3"><input name="start_date" className="ta-input" defaultValue="2017-04-01"/><input name="maturity_date" className="ta-input" defaultValue="2032-04-01"/><input name="extension_years" className="ta-input" defaultValue="5"/></div><div className="grid gap-4 md:grid-cols-3"><input name="current_balance" className="ta-input" defaultValue="0"/><input name="contribution_this_fy" className="ta-input" defaultValue="0"/><input name="target_contribution_fy" className="ta-input" defaultValue="150000"/></div><div className="grid gap-4 md:grid-cols-3"><input name="fy_deadline_date" className="ta-input" defaultValue={`${dayjs().year()}-03-31`}/><input name="last_contribution_date" className="ta-input"/><input name="status" className="ta-input" defaultValue="active"/></div><input name="notes" className="ta-input"/><button className="ta-btn" type="submit">Save PPF</button></form>
    <div className="ta-card overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Bank</th><th>Account</th><th>Balance</th><th>FY Progress</th><th>Deadline</th><th>Maturity</th></tr></thead><tbody>{ppf.map((p)=><tr key={p.id}><td>{p.bank_name}</td><td>{p.account_number}</td><td>{formatCurrency(p.current_balance)}</td><td>{formatCurrency(p.contribution_this_fy)} / {formatCurrency(p.target_contribution_fy)}</td><td>{p.fy_deadline_date}</td><td>{p.maturity_date}</td></tr>)}</tbody></table></div></div>;
}
