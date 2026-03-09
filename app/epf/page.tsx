import dayjs from "dayjs";
import { saveEPFAction, saveInsuranceAction, savePPFAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function EPFPage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const epf = await repo.listEPFAccounts();
  const total = epf.reduce((s, e) => s + e.current_balance, 0);

  return <div className="space-y-5"><h1 className="text-2xl font-bold">EPF Tracker</h1><div className="ta-card p-4"><p className="text-xs text-slate-500">Total EPF</p><p className="text-xl font-bold">{formatCurrency(total)}</p></div>
    <form action={saveEPFAction} className="ta-card space-y-4 p-5"><div className="grid gap-4 md:grid-cols-3"><input name="employer_name" className="ta-input" placeholder="Employer"/><input name="uan" className="ta-input" placeholder="UAN"/><input name="member_id" className="ta-input" placeholder="Member ID"/></div><div className="grid gap-4 md:grid-cols-3"><input name="current_balance" className="ta-input" defaultValue="0"/><input name="employee_monthly" className="ta-input" defaultValue="0"/><input name="employer_monthly" className="ta-input" defaultValue="0"/></div><div className="grid gap-4 md:grid-cols-3"><input name="interest_rate" className="ta-input" defaultValue="8.15"/><input name="last_interest_credit_date" className="ta-input" defaultValue="2025-03-31"/><input name="status" className="ta-input" defaultValue="active"/></div><input name="notes" className="ta-input" placeholder="Notes"/><button className="ta-btn" type="submit">Save EPF</button></form>
    <div className="ta-card overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Employer</th><th>UAN</th><th>Balance</th><th>Monthly Total</th><th>Last Interest</th></tr></thead><tbody>{epf.map((e)=><tr key={e.id}><td>{e.employer_name}</td><td>{e.uan}</td><td>{formatCurrency(e.current_balance)}</td><td>{formatCurrency(e.employee_monthly+e.employer_monthly)}</td><td>{e.last_interest_credit_date}</td></tr>)}</tbody></table></div>
  </div>;
}
