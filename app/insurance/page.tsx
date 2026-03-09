import dayjs from "dayjs";
import { saveInsuranceAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function InsurancePage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const policies = await repo.listInsurancePolicies();

  return <div className="space-y-5"><h1 className="text-2xl font-bold">Insurance Tracker</h1>
    <form action={saveInsuranceAction} className="ta-card space-y-4 p-5"><div className="grid gap-4 md:grid-cols-3"><input name="policy_type" className="ta-input" defaultValue="term"/><input name="insurer_name" className="ta-input" placeholder="Insurer"/><input name="policy_number" className="ta-input" placeholder="Policy Number"/></div><div className="grid gap-4 md:grid-cols-3"><input name="holder_name" className="ta-input" defaultValue="Owner"/><input name="sum_assured" className="ta-input" defaultValue="10000000"/><input name="premium_amount" className="ta-input" defaultValue="20000"/></div><div className="grid gap-4 md:grid-cols-3"><input name="premium_frequency" className="ta-input" defaultValue="yearly"/><input name="next_due_date" className="ta-input" defaultValue={dayjs().add(20,"day").format("YYYY-MM-DD")}/><input name="grace_days" className="ta-input" defaultValue="30"/></div><div className="grid gap-4 md:grid-cols-3"><input name="start_date" className="ta-input" defaultValue={dayjs().subtract(1,"year").format("YYYY-MM-DD")}/><input name="end_date" className="ta-input"/><input name="nominee_name" className="ta-input"/></div><div className="grid gap-4 md:grid-cols-2"><input name="status" className="ta-input" defaultValue="active"/><input name="notes" className="ta-input"/></div><button className="ta-btn" type="submit">Save Policy</button></form>
    <div className="ta-card overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Insurer</th><th>Type</th><th>Policy</th><th>Premium</th><th>Next Due</th><th>Grace</th><th>Status</th></tr></thead><tbody>{policies.map((p)=><tr key={p.id}><td>{p.insurer_name}</td><td>{p.policy_type}</td><td>{p.policy_number}</td><td>{formatCurrency(p.premium_amount)}</td><td>{p.next_due_date} ({dayjs(p.next_due_date).diff(dayjs(),"day")}d)</td><td>{p.grace_days}d</td><td>{p.status}</td></tr>)}</tbody></table></div></div>;
}
