import dayjs from "dayjs";
import { saveInsuranceAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default async function InsurancePage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const policies = await repo.listInsurancePolicies();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Insurance Tracker</h1>
      <form action={saveInsuranceAction} className="ta-card space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Policy Type">
            <select name="policy_type" className="ta-input" defaultValue="term">
              <option value="term">Term</option>
              <option value="life">Life</option>
              <option value="health">Health</option>
              <option value="hospital_cash">Hospital Cash</option>
              <option value="accident">Personal Accident</option>
              <option value="critical_illness">Critical Illness</option>
            </select>
          </Field>
          <Field label="Insurer Name"><input name="insurer_name" className="ta-input" placeholder="Insurer" /></Field>
          <Field label="Policy Number"><input name="policy_number" className="ta-input" placeholder="Policy Number" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Holder Name"><input name="holder_name" className="ta-input" defaultValue="Owner" /></Field>
          <Field label="Sum Assured"><input name="sum_assured" className="ta-input" defaultValue="10000000" /></Field>
          <Field label="Premium Amount"><input name="premium_amount" className="ta-input" defaultValue="20000" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Premium Frequency"><input name="premium_frequency" className="ta-input" defaultValue="yearly" /></Field>
          <Field label="Next Due Date"><input name="next_due_date" type="date" className="ta-input" defaultValue={dayjs().add(20, "day").format("YYYY-MM-DD")} /></Field>
          <Field label="Grace Days"><input name="grace_days" className="ta-input" defaultValue="30" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Start Date"><input name="start_date" type="date" className="ta-input" defaultValue={dayjs().subtract(1, "year").format("YYYY-MM-DD")} /></Field>
          <Field label="End Date"><input name="end_date" type="date" className="ta-input" /></Field>
          <Field label="Nominee Name"><input name="nominee_name" className="ta-input" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Status"><input name="status" className="ta-input" defaultValue="active" /></Field>
          <Field label="Notes"><input name="notes" className="ta-input" /></Field>
        </div>
        <button className="ta-btn" type="submit">Save Policy</button>
      </form>
      <div className="ta-card overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Insurer</th><th>Type</th><th>Policy</th><th>Premium</th><th>Next Due</th><th>Grace</th><th>Status</th></tr></thead><tbody>{policies.map((p)=><tr key={p.id}><td>{p.insurer_name}</td><td>{p.policy_type}</td><td>{p.policy_number}</td><td>{formatCurrency(p.premium_amount)}</td><td>{p.next_due_date} ({dayjs(p.next_due_date).diff(dayjs(),"day")}d)</td><td>{p.grace_days}d</td><td>{p.status}</td></tr>)}</tbody></table></div>
    </div>
  );
}
